const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Ensure this is installed!
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// UPDATED CORS SETTINGS
app.use(cors({
    origin: 'https://kraimssj.github.io', // Your GitHub URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// 1. Connect to the Real Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🔥 Connected to MongoDB!"))
    .catch(err => console.log("❌ DB Error:", err));

// 2. Define the "User" Shape (Schema)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// 3. Define the "Product" Shape
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    desc: String
});
const Product = mongoose.model('Product', productSchema);

// --- ROUTES ---

// REGISTER (Now saves to MongoDB)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User saved to DB!", user: { name, email } });
});

// LOGIN (Now checks MongoDB)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { name: user.name, email: user.email } });
});

// GET PRODUCTS (Now pulls from MongoDB)
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query; // Get both from the URL
        let query = {};

        // If there's a search term, add it to our database filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // If there's a category, add it to our database filter
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
        res.status(500).json({ message: err.message });
    }
});

app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`));
// Order Model
const orderSchema = new mongoose.Schema({
    userEmail: String,
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Route to Place Order
app.post('/api/orders', async (req, res) => {
    const { userEmail, items, total } = req.body;
    const newOrder = new Order({ userEmail, items, total });
    await newOrder.save();
    res.json({ message: "Order saved!", order: newOrder });
});

// Route to Get User Orders
app.get('/api/orders/:email', async (req, res) => {
    const userOrders = await Order.find({ userEmail: req.params.email }).sort({ date: -1 });
    res.json(userOrders);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
