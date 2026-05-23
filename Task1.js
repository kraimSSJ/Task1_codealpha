// Mock Database
let products = [
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


// State Management
let cart = [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let orders = [];


window.onload = async () => {
    try {
        // 1. Fetch data from our Node.js server
        const response = await fetch('https://task1codealpha-production-e12c.up.railway.app/api/products');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // 2. Convert the response to JSON
        products = await response.json(); 
        console.log('Products loaded:', products);
        
        // 3. Draw them on the screen using your existing function
        renderProducts(products); 
    } catch (error) {
        console.error("Failed to connect to backend:", error);
        showToast("⚠️ Could not load products. Make sure the backend is running!");
        document.getElementById('product-grid').innerHTML = `
            <div class="col-span-full text-center py-10 text-red-500">
                <p class="font-bold">❌ Connection Error</p>
                <p class="text-sm">${error.message}</p>
            </div>
        `;
    }
    
    updateAuthUI();
    updateCartUI();
};

// UI View Controller
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${viewName}`).classList.remove('hidden');
    window.scrollTo(0,0);
}

// Product Rendering
function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    
    if (!items || items.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400"><p>No products found</p></div>';
        return;
    }
    
    grid.innerHTML = items.map(p => `
    <div class="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 product-card border border-gray-100">
        <div class="relative h-64 overflow-hidden bg-gray-200" onclick="openProductModal('${p.id || p._id}')">
            <img src="${p.image || 'https://via.placeholder.com/300x300?text=No+Image'}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition"></div>
            
            <button onclick="event.stopPropagation(); addToCart('${p.id || p._id}')" class="quick-add absolute bottom-4 left-4 right-4 bg-white text-gray-900 py-2 rounded-lg font-bold shadow-lg opacity-0 transform translate-y-4 transition-all duration-300 hover:bg-indigo-600 hover:text-white">
                Quick Add
            </button>
        </div>
        <div class="p-5">
            <span class="text-xs font-bold text-indigo-500 uppercase">${p.category || 'Uncategorized'}</span>
            
            <h3 class="text-lg font-bold mt-1 mb-2 truncate" onclick="openProductModal('${p.id || p._id}')">${p.name}</h3>
            
            <div class="flex justify-between items-center">
                <span class="text-xl font-extrabold text-gray-900">$${parseFloat(p.price).toFixed(2)}</span>
                <div class="flex text-yellow-400 text-xs">
                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                </div>
            </div>
        </div>
    </div>
`).join('');
}

async function filterCategory(cat) {
    try {
        // We call the backend with ?category=Electronics (or Apparel, etc.)
        const response = await fetch(`https://task1codealpha-production-e12c.up.railway.app/api/products?category=${encodeURIComponent(cat)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const filteredData = await response.json();
        
        document.getElementById('category-title').innerText = `${cat} Collection`;
        renderProducts(filteredData);
        showView('home');
    } catch (error) {
        console.error("Category filter failed:", error);
        showToast("Failed to filter by category");
    }
}

async function searchProducts(query) {
    try {
        if (!query.trim()) {
            // If search is empty, show all products
            renderProducts(products);
            return;
        }
        
        // We add "?search=word" to the end of the URL
        const response = await fetch(`https://task1codealpha-production-e12c.up.railway.app/api/products?search=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const filteredData = await response.json();
        
        // Render only what the server sent back
        renderProducts(filteredData);
    } catch (error) {
        console.error("Search failed:", error);
        showToast("Search failed");
    }
}

// Modal Logic
function openProductModal(id) {
    const p = products.find(x => (x.id || x._id) === id);
    
    if (!p) {
        console.error('Product not found:', id);
        return;
    }
    
    document.getElementById('modal-img').src = p.image || 'https://via.placeholder.com/300x300?text=No+Image';
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.desc || 'No description available';
    document.getElementById('modal-price').innerText = `$${parseFloat(p.price).toFixed(2)}`;
    document.getElementById('modal-category').innerText = p.category || 'Uncategorized';
    document.getElementById('modal-add-btn').onclick = () => { addToCart(p.id || p._id); closeProductModal(); };
    
    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Cart Logic
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('hidden');
}

function addToCart(id) {
    const product = products.find(p => (p.id || p._id) === id);
    
    if (!product) {
        console.error('Product not found for cart:', id);
        return;
    }
    
    const exists = cart.find(item => (item.id || item._id) === id);
    
    if (exists) {
        exists.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    showToast(`Added ${product.name} to cart!`);
}

function updateQuantity(id, delta) {
    // Handle both id and _id fields from MongoDB
    const item = cart.find(x => (x.id || x._id).toString() === id.toString()); 
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(x => (x.id || x._id).toString() !== id.toString());
        }
        updateCartUI();
    }
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    const countDisplay = document.getElementById('cart-count');

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-gray-400"><i class="fas fa-shopping-basket text-4xl mb-4"></i><p>Your cart is empty</p></div>`;
        totalDisplay.innerText = "$0.00";
        countDisplay.innerText = "0";
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <img src="${item.image || 'https://via.placeholder.com/64x64'}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/64x64'">
            <div class="flex-grow">
                <h4 class="font-bold text-sm">${item.name}</h4>
                <p class="text-indigo-600 font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="flex items-center bg-white border rounded-lg">
                <button onclick="updateQuantity('${item.id || item._id}', -1)" class="px-2 py-1 text-gray-400 hover:text-indigo-600">-</button>
                <span class="px-2 text-xs font-bold">${item.quantity}</span>
                <button onclick="updateQuantity('${item.id || item._id}', 1)" class="px-2 py-1 text-gray-400 hover:text-indigo-600">+</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalDisplay.innerText = `$${total.toFixed(2)}`;
    countDisplay.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Checkout Logic
async function processCheckout() {
    if (!currentUser) {
        showToast("Please login to place an order");
        toggleCart();
        showView('login');
        return;
    }
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch('https://task1codealpha-production-e12c.up.railway.app/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userEmail: currentUser.email,
                items: cart,
                total: total
            })
        });

        if (response.ok) {
            const orderData = await response.json();
            console.log('Order placed:', orderData);
            
            cart = [];
            updateCartUI();
            toggleCart();
            await fetchUserOrders(); // Refresh the list
            showView('orders');
            showToast("✅ Order Placed Successfully!");
        } else {
            const errorData = await response.json();
            showToast("Order failed: " + (errorData.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Order failed:", error);
        showToast("Order error: " + error.message);
    }
}

function renderOrders(ordersData = orders) {
    const container = document.getElementById('orders-list');
    
    if (!ordersData || ordersData.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-400">You haven't placed any orders yet.</p>`;
        return;
    }

    container.innerHTML = ordersData.map(order => `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                    <p class="text-xs text-gray-400">Order ID: #${order._id || order.id}</p>
                    <p class="font-bold">${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">Delivered</span>
                </div>
            </div>
            <div class="space-y-2">
                ${order.items.map(item => `
                    <div class="flex justify-between text-sm">
                        <span>${item.name} x ${item.quantity}</span>
                        <span class="font-medium">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span class="text-indigo-600">$${parseFloat(order.total).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

// Auth Logic
async function handleAuth(event, type) {
    event.preventDefault();
    
    // Get values from the form
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;
    const nameInput = document.getElementById('reg-name');
    const name = nameInput ? nameInput.value : "";

    if (!email || !password || (type === 'register' && !name)) {
        showToast("Please fill in all fields");
        return;
    }

    try {
        // We tell the backend to "Register" or "Login"
        const response = await fetch(`https://task1codealpha-production-e12c.up.railway.app/api/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // Store token if provided
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            updateAuthUI();
            showView('home');
            showToast(`✅ Welcome, ${currentUser.name}!`);
            
            // Fetch user orders if logged in
            await fetchUserOrders();
        } else {
            showToast(data.message || "Authentication failed");
        }
    } catch (error) {
        console.error("Auth error:", error);
        showToast("Auth error: " + error.message);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    orders = [];
    updateAuthUI();
    showView('home');
    showToast("Logged out successfully");
}

function updateAuthUI() {
    const links = document.getElementById('auth-links');
    const profile = document.getElementById('user-profile');
    const username = document.getElementById('username-display');

    if (currentUser) {
        links.classList.add('hidden');
        profile.classList.remove('hidden');
        username.innerText = currentUser.name;
    } else {
        links.classList.remove('hidden');
        profile.classList.add('hidden');
    }
}

// Utilities
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = msg;
        toast.classList.remove('opacity-0');
        setTimeout(() => toast.classList.add('opacity-0'), 3000);
    } else {
        console.warn('Toast element not found');
        alert(msg);
    }
}

async function fetchUserOrders() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`https://task1codealpha-production-e12c.up.railway.app/api/orders/${encodeURIComponent(currentUser.email)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const ordersFromDB = await response.json();
        orders = ordersFromDB;
        console.log('Orders fetched:', orders);
        renderOrders(orders);
    } catch (error) {
        console.error("Failed to load orders:", error);
        renderOrders([]);
    }
}
