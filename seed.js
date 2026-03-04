require('dotenv').config();
const mongoose = require('mongoose');

// Connect to the same DB
mongoose.connect(process.env.MONGO_URI);

// Define the Product model (must match server.js)
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    desc: String
}));

const products = [
            { id: 1, name: "Premium Leather Watch", price: 199.99, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", desc: "A sophisticated timepiece featuring genuine Italian leather and Swiss movement precision." },
            { id: 2, name: "Noise Cancelling Headphones", price: 299.00, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800", desc: "Pure sound, zero distraction. Industry-leading noise cancellation for your commute or focus." },
            { id: 3, name: "Minimalist Linen Shirt", price: 75.00, category: "Apparel", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800", desc: "Breathable, sustainable, and stylish. Perfect for warm days and smart-casual evenings." },
            { id: 4, name: "Smart Fitness Tracker", price: 129.50, category: "Electronics", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=800", desc: "Track every heartbeat, step, and calorie. Waterproof and compatible with all major health apps." },
            { id: 5, name: "Architect Backpack", price: 110.00, category: "Apparel", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800", desc: "Ergonomic design with padded laptop sleeve and weather-resistant canvas." },
            { id: 6, name: "Ergonomic Desk Chair", price: 450.00, category: "Home", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800", desc: "Redefine your workspace comfort with full lumbar support and premium mesh breathability." },
            { id: 7, name: "Ceramic Drip Kettle", price: 45.99, category: "Home", image: "https://i.pinimg.com/1200x/27/f4/21/27f4219121703a4a0effe0f98e446b7f.jpg", desc: "For the coffee enthusiast. Precision spout for the perfect pour-over experience." },
            { id: 8, name: "Indigo Denim Jacket", price: 120.00, category: "Apparel", image: "https://images.unsplash.com/photo-1527010154944-f2241763d806?auto=format&fit=crop&q=80&w=800", desc: "Classic cut, raw denim that ages beautifully with time." },
            { id: 9, name: "Smart Home Speaker", price: 89.00, category: "Electronics", image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&q=80&w=800", desc: "Voice-controlled high-fidelity audio system that integrates seamlessly with your smart home." },
            { id: 10, name: "Mechanical Keyboard", price: 155.00, category: "Electronics", image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800", desc: "Tactile response, customizable RGB lighting, and premium aluminum build for the ultimate typing experience." },
            { id: 11, name: "Leather Messenger Bag", price: 185.00, category: "Apparel", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800", desc: "Hand-crafted full-grain leather bag designed for the modern professional." },
            { id: 12, name: "Polarized Sunglasses", price: 140.00, category: "Apparel", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800", desc: "Protect your eyes with style. Italian-made frames with advanced polarized lens technology." },
            { id: 13, name: "Minimalist Table Lamp", price: 65.00, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800", desc: "Elegant lighting solution with a warm glow, perfect for bedside tables or reading nooks." },
            { id: 14, name: "Cast Iron Skillet", price: 55.00, category: "Home", image: "https://i.pinimg.com/1200x/25/67/ad/2567ad1a3c0829df235d171d9f8f4a53.jpg", desc: "Professional-grade pre-seasoned cast iron for perfect heat retention and distribution." },
            { id: 15, name: "Eco-Friendly Yoga Mat", price: 40.00, category: "Home", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=800", desc: "Non-slip surface made from sustainable materials. Extra cushioning for joint support." },
            { id: 16, name: "Insulated Water Bottle", price: 35.00, category: "Home", image: "https://i.pinimg.com/1200x/bc/5e/d4/bc5ed41e1da0e32fb2c32742d626c2d6.jpg", desc: "Keeps beverages cold for 24 hours or hot for 12. Durable stainless steel design." }
        ];
const seedDB = async () => {
    await Product.deleteMany({}); // Clears the list first
    await Product.insertMany(products); // Adds the list
    console.log("🌱 Database Seeded with Products!");
    process.exit();
};

seedDB();