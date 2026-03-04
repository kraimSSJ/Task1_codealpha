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
const products = [
            { id: 1, name: "Premium Leather Watch", price: 199.99, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", desc: "A sophisticated timepiece featuring genuine Italian leather and Swiss movement precision." },
            { id: 2, name: "Noise Cancelling Headphones", price: 299.00, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800", desc: "Pure sound, zero distraction. Industry-leading noise cancellation for your commute or focus." },
            { id: 3, name: "Minimalist Linen Shirt", price: 75.00, category: "Apparel", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800", desc: "Breathable, sustainable, and stylish. Perfect for warm days and smart-casual evenings." },
            { id: 4, name: "Smart Fitness Tracker", price: 129.50, category: "Electronics", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=800", desc: "Track every heartbeat, step, and calorie. Waterproof and compatible with all major health apps." },
            { id: 5, name: "Architect Backpack", price: 110.00, category: "Apparel", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800", desc: "Ergonomic design with padded laptop sleeve and weather-resistant canvas." },
            { id: 6, name: "Ergonomic Desk Chair", price: 450.00, category: "Home", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800", desc: "Redefine your workspace comfort with full lumbar support and premium mesh breathability." },
            { id: 7, name: "Ceramic Drip Kettle", price: 45.99, category: "Home", image: "https://images.unsplash.com/photo-1544787210-2211d7c309c7?auto=format&fit=crop&q=80&w=800", desc: "For the coffee enthusiast. Precision spout for the perfect pour-over experience." },
            { id: 8, name: "Indigo Denim Jacket", price: 120.00, category: "Apparel", image: "https://images.unsplash.com/photo-1527010154944-f2241763d806?auto=format&fit=crop&q=80&w=800", desc: "Classic cut, raw denim that ages beautifully with time." },
            { id: 9, name: "Smart Home Speaker", price: 89.00, category: "Electronics", image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800", desc: "Voice-controlled high-fidelity audio system that integrates seamlessly with your smart home." },
            { id: 10, name: "Mechanical Keyboard", price: 155.00, category: "Electronics", image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800", desc: "Tactile response, customizable RGB lighting, and premium aluminum build for the ultimate typing experience." },
            { id: 11, name: "Leather Messenger Bag", price: 185.00, category: "Apparel", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800", desc: "Hand-crafted full-grain leather bag designed for the modern professional." },
            { id: 12, name: "Polarized Sunglasses", price: 140.00, category: "Apparel", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800", desc: "Protect your eyes with style. Italian-made frames with advanced polarized lens technology." },
            { id: 13, name: "Minimalist Table Lamp", price: 65.00, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800", desc: "Elegant lighting solution with a warm glow, perfect for bedside tables or reading nooks." },
            { id: 14, name: "Cast Iron Skillet", price: 55.00, category: "Home", image: "https://images.unsplash.com/photo-1590113251509-5a507851d953?auto=format&fit=crop&q=80&w=800", desc: "Professional-grade pre-seasoned cast iron for perfect heat retention and distribution." },
            { id: 15, name: "Eco-Friendly Yoga Mat", price: 40.00, category: "Home", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800", desc: "Non-slip surface made from sustainable materials. Extra cushioning for joint support." },
            { id: 16, name: "Insulated Water Bottle", price: 35.00, category: "Home", image: "https://images.unsplash.com/photo-1602143399827-bd95ef6f421c?auto=format&fit=crop&q=80&w=800", desc: "Keeps beverages cold for 24 hours or hot for 12. Durable stainless steel design." }
        ];

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
