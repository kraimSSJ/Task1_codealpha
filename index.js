const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// 1. AGGRESSIVE CORS SETUP (Matches your frontend needs)
app.use(cors({ origin: '*' }));
app.use(express.json());

// 2. SCHEMAS
const User = mongoose.model('User', new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: Number, category: String, image: String, desc: String
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    userEmail: String, items: Array, total: Number, date: { type: Date, default: Date.now }
}));

// 3. YOUR 16 PRODUCTS (Auto-Seed List)
const initialProducts = [
    { name: "Premium Leather Watch", price: 199.99, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", desc: "A sophisticated timepiece featuring genuine Italian leather." },
    { name: "Noise Cancelling Headphones", price: 299.00, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", desc: "Pure sound, zero distraction." },
    { name: "Minimalist Linen Shirt", price: 75.00, category: "Apparel", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c", desc: "Breathable and sustainable." },
    { name: "Smart Fitness Tracker", price: 129.50, category: "Electronics", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6", desc: "Track every heartbeat and step." },
    { name: "Architect Backpack", price: 110.00, category: "Apparel", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", desc: "Ergonomic design with laptop sleeve." },
    { name: "Ergonomic Desk Chair", price: 450.00, category: "Home", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1", desc: "Lumbar support and premium mesh." },
    { name: "Ceramic Drip Kettle", price: 45.99, category: "Home", image: "https://images.unsplash.com/photo-1544787210-2211d7c309c7", desc: "Precision spout for coffee lovers." },
    { name: "Indigo Denim Jacket", price: 120.00, category: "Apparel", image: "https://images.unsplash.com/photo-1527010154944-f2241763d806", desc: "Classic cut raw denim." },
    { name: "Smart Home Speaker", price: 89.00, category: "Electronics", image: "https://images.unsplash.com/photo-1589003077984-894e133dabab", desc: "High-fidelity audio system." },
    { name: "Mechanical Keyboard", price: 155.00, category: "Electronics", image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae", desc: "Tactile response and customizable RGB." },
    { name: "Leather Messenger Bag", price: 185.00, category: "Apparel", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa", desc: "Hand-crafted full-grain leather." },
    { name: "Polarized Sunglasses", price: 140.00, category: "Apparel", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f", desc: "Italian-made frames." },
    { name: "Minimalist Table Lamp", price: 65.00, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c", desc: "Elegant lighting with warm glow." },
    { name: "Cast Iron Skillet", price: 55.00, category: "Home", image: "https://images.unsplash.com/photo-1590113251509-5a507851d953", desc: "Professional-grade cast iron." },
    { name: "Eco-Friendly Yoga Mat", price: 40.00, category: "Home", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c", desc: "Sustainable non-slip surface." },
    { name: "Insulated Water Bottle", price: 35.00, category: "Home", image: "https://images.unsplash.com/photo-1602143399827-bd95ef6f421c", desc: "Stainless steel stays cold 24h." }
];

// 4. DB CONNECTION & AUTO-SEED
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("🔥 Connected to MongoDB!");
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("🌱 Database empty. Seeding all 16 products...");
            await Product.insertMany(initialProducts);
        }
    }).catch(err => console.log("❌ DB Error:", err));

// 5. AUTH ROUTES (Fixed for Account Creation)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Fields missing" });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email taken" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.json({ message: "Created", user: { name, email } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret');
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. PRODUCT & ORDER ROUTES
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on ${PORT}`));
