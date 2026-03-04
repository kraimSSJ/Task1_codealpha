// Mock Database
let products = []

// State Management
let cart = [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let orders = JSON.parse(localStorage.getItem('orders')) || [];


window.onload = async () => {
    try {
        // 1. Fetch data from our Node.js server
        const response = await fetch('https://task1codealpha-production.up.railway.app/api/products');
        
        // 2. Convert the response to JSON
        products = await response.json(); 
        
        // 3. Draw them on the screen using your existing function
        renderProducts(products); 
    } catch (error) {
        console.error("Failed to connect to backend:", error);
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
    grid.innerHTML = items.map(p => `
    <div class="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 product-card border border-gray-100">
        <div class="relative h-64 overflow-hidden bg-gray-200" onclick="openProductModal('${p.id}')">
            <img src="${p.image}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition"></div>
            
            <button onclick="event.stopPropagation(); addToCart('${p.id}')" class="quick-add absolute bottom-4 left-4 right-4 bg-white text-gray-900 py-2 rounded-lg font-bold shadow-lg opacity-0 transform translate-y-4 transition-all duration-300 hover:bg-indigo-600 hover:text-white">
                Quick Add
            </button>
        </div>
        <div class="p-5">
            <span class="text-xs font-bold text-indigo-500 uppercase">${p.category}</span>
            
            <h3 class="text-lg font-bold mt-1 mb-2 truncate" onclick="openProductModal('${p.id}')">${p.name}</h3>
            
            <div class="flex justify-between items-center">
                <span class="text-xl font-extrabold text-gray-900">$${p.price.toFixed(2)}</span>
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
        const response = await fetch(`https://task1codealpha-production.up.railway.app/api/products?category=${cat}`);
        const filteredData = await response.json();
        
        document.getElementById('category-title').innerText = `${cat} Collection`;
        renderProducts(filteredData);
        showView('home');
    } catch (error) {
        console.error("Category filter failed:", error);
    }
}

async function searchProducts(query) {
    try {
        // We add "?search=word" to the end of the URL
        const response = await fetch(`https://task1codealpha-production.up.railway.app/api/products?search=${query}`);
        const filteredData = await response.json();
        
        // Render only what the server sent back
        renderProducts(filteredData);
    } catch (error) {
        console.error("Search failed:", error);
    }
}

// Modal Logic
function openProductModal(id) {
    const p = products.find(x => x.id === id);
    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-desc').innerText = p.desc;
    document.getElementById('modal-price').innerText = `$${p.price.toFixed(2)}`;
    document.getElementById('modal-category').innerText = p.category;
    document.getElementById('modal-add-btn').onclick = () => { addToCart(p.id); closeProductModal(); };
    
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
    const product = products.find(p => p.id === id);
    const exists = cart.find(item => item.id === id);
    
    if (exists) {
        exists.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    showToast(`Added ${product.name} to cart!`);
}

function updateQuantity(id, delta) {
    // We use .toString() just in case to match the types perfectly
    const item = cart.find(x => x.id.toString() === id.toString()); 
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(x => x.id.toString() !== id.toString());
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
            <img src="${item.image}" class="w-16 h-16 object-cover rounded-lg">
            <div class="flex-grow">
                <h4 class="font-bold text-sm">${item.name}</h4>
                <p class="text-indigo-600 font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div class="flex items-center bg-white border rounded-lg">
                <button onclick="updateQuantity(${item.id}, -1)" class="px-2 py-1 text-gray-400 hover:text-indigo-600">-</button>
                <span class="px-2 text-xs font-bold">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)" class="px-2 py-1 text-gray-400 hover:text-indigo-600">+</button>
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
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        const response = await fetch('https://task1codealpha-production.up.railway.app/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userEmail: currentUser.email,
                items: cart,
                total: total
            })
        });

        if (response.ok) {
            cart = [];
            updateCartUI();
            toggleCart();
            await fetchUserOrders(); // Refresh the list
            showView('orders');
            showToast("Order Placed Successfully!");
        }
    } catch (error) {
        console.error("Order failed:", error);
    }
}

function renderOrders() {
    const container = document.getElementById('orders-list');
    if (orders.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-400">You haven't placed any orders yet.</p>`;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                    <p class="text-xs text-gray-400">Order ID: #${order.id}</p>
                    <p class="font-bold">${order.date}</p>
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
                <span class="text-indigo-600">$${order.total.toFixed(2)}</span>
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

    try {
        // We tell the backend to "Register" or "Login"
        const response = await fetch(`https://task1codealpha-production.up.railway.app/api/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateAuthUI();
            showView('home');
            showToast(`Welcome, ${currentUser.name}!`);
        } else {
            showToast(data.message || "Authentication failed");
        }
    } catch (error) {
        console.error("Auth error:", error);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
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
        renderOrders();
    } else {
        links.classList.remove('hidden');
        profile.classList.add('hidden');
    }
}

// Utilities
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('opacity-0');
    setTimeout(() => toast.classList.add('opacity-0'), 3000);
}
async function fetchUserOrders() {
    if (!currentUser) return;
    try {
        const response = await fetch(`https://task1codealpha-production.up.railway.app/api/orders/${currentUser.email}`);
        const ordersFromDB = await response.json();
        renderOrders(ordersFromDB);
    } catch (error) {
        console.error("Failed to load orders:", error);
    }
}