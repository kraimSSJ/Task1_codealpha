const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ===== AGGRESSIVE CORS SETUP =====
// Enable CORS for all origins (can restrict later)
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

// Additional CORS headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== DATABASE CONNECTION =====
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🔥 Connected to MongoDB!"))
    .catch(err => console.log("❌ DB Error:", err));

// ===== SCHEMAS & MODELS =====

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    desc: String
});
const Product = mongoose.model('Product', productSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
    userEmail: String,
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({ 
        status: 'OK',
        message: "🚀 Server is running!", 
        timestamp: new Date().toISOString(),
        database: dbStatus
    });
});

// ===== AUTHENTICATION ROUTES =====

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully!", user: { name, email } });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});

// ===== PRODUCT ROUTES =====

// GET PRODUCTS (with search & filter)
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query);

        const formattedProducts = products.map(p => ({
            ...p.toObject(),
            id: p._id.toString()
        }));

        res.json(formattedProducts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products", error: err.message });
    }
});

// ===== ORDER ROUTES =====

// PLACE ORDER
app.post('/api/orders', async (req, res) => {
    try {
        const { userEmail, items, total } = req.body;

        if (!userEmail || !items || !total) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newOrder = new Order({ userEmail, items, total });
        await newOrder.save();

        res.json({ message: "Order placed successfully!", order: newOrder });
    } catch (err) {
        res.status(500).json({ message: "Failed to place order", error: err.message });
    }
});

// GET USER ORDERS
app.get('/api/orders/:email', async (req, res) => {
    try {
        const userOrders = await Order.find({ userEmail: req.params.email }).sort({ date: -1 });
        res.json(userOrders);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", path: req.path });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 CORS enabled for all origins`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
