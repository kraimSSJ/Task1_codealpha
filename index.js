const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// 1. YOUR AGGRESSIVE CORS SETUP
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// 2. PRODUCT DATA FOR SEEDING
const initialProducts = [
    { name: "Premium Leather Watch", price: 199.99, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", desc: "A sophisticated timepiece featuring genuine Italian leather." },
    { name: "Noise Cancelling Headphones", price: 299.00, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", desc: "Pure sound, zero distraction. Industry-leading noise cancellation." },
    { name: "Minimalist Linen Shirt", price: 75.00, category: "Apparel", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c", desc: "Breathable, sustainable, and stylish." },
    { name: "Smart Fitness Tracker", price: 129.50, category: "Electronics", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6", desc: "Track every heartbeat, step, and calorie." },
    { name: "Architect Backpack", price: 110.00, category: "Apparel", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", desc: "Ergonomic design with padded laptop sleeve." },
    { name: "Ergonomic Desk Chair", price: 450.00, category: "Home", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1", desc: "Redefine your workspace comfort." },
    { name: "Ceramic Drip Kettle", price: 45.99, category: "Home", image: "https://images.unsplash.com/photo-1544787210-2211d7c309c7", desc: "Precision spout for the perfect pour-over." },
    { name: "Indigo Denim Jacket", price: 120.00, category: "Apparel", image: "https://images.unsplash.com/photo-1527010154944-f2241763d806", desc: "Classic cut, raw denim that ages beautifully." },
    { name: "Smart Home Speaker", price: 89.00, category: "Electronics", image: "https://images.unsplash.com/photo-1589003077984-894e133dabab", desc: "Voice-controlled high-fidelity audio system." },
    { name: "Mechanical Keyboard", price: 155.00, category: "Electronics", image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae", desc: "Tactile response and customizable RGB." },
    { name: "Leather Messenger Bag", price: 185.00, category: "Apparel", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa", desc: "Hand-crafted full-grain leather bag." },
    { name: "Polarized Sunglasses", price: 140.00, category: "Apparel", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f", desc: "Advanced polarized lens technology." },
    { name: "Minimalist Table Lamp", price: 65.00, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c", desc: "Elegant lighting solution with a warm glow." },
    { name: "Cast Iron Skillet", price: 55.00, category: "Home", image: "https://images.unsplash.com/photo-1590113251509-5a507851d953", desc: "Professional-grade pre-seasoned cast iron." },
    { name: "Eco-Friendly Yoga Mat", price: 40.00, category: "Home", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c", desc: "Non-slip surface from sustainable materials." },
    { name: "Insulated Water Bottle", price: 35.00, category: "Home", image: "https://images.unsplash.com/photo-1602143399827-bd95ef6f421c", desc: "Durable stainless steel design." }
];

// 3. SCHEMAS & MODELS
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: Number, category: String, image: String, desc: String
}));

const User = mongoose.model('User', new mongoose.Schema({
    name: String, email: { type: String, unique: true }, password: String
}));

// 4. DB CONNECTION & AUTO-SEED
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("🔥 Connected to MongoDB!");
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("🌱 Database empty. Seeding your 16 products...");
            await Product.insertMany(initialProducts);
            console.log("✅ Seeding complete.");
        }
    })
    .catch(err => console.log("❌ DB Error:", err));

// 5. ROUTES
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        const products = await Product.find(query);
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
});

// Auth, Orders, Health check... (Keep your existing routes here)

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server live on ${PORT}`));
