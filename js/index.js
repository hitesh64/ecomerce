// Helper to break up long tasks
const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';


// --- 1. GLOBAL STATE ---
let products = [];
let bannerInterval;
let sundayInterval = null;
let trackingInterval = null;
let categorySlideInterval = null; // ✅ Ye line zaroori hai

let state = {
    user: null,
    cart: [],
    wishlist: [],
    orders: [],
    searchQuery: "",
    currentProductId: null,
    currentImageIndex: 0,
    selectedSize: null,
    currentQuantity: 1
};
let activeFilters = {
    mainCat: null,
    subCat: null,
    search: ""
};
let homeSlideshowInterval = null;

const homeBannerConfig = {
    // 9 Regular Images (Somwar - Shanivar dikhengi)
    regularImages: [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80", // 1. Fashion
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&q=80", // 2. Lifestyle
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80", // 3. Shopping Bags
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80", // 4. Store
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80", // 5. Products
        "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=1200&q=80", // 6. Women Fashion
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=80", // 7. Men Fashion
        "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=1200&q=80", // 8. Accessories
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80"  // 9. Shoes
    ],
    // 1 Special Image (Jo sirf Sunday ko total 10 karegi)
    sundaySpecialImage: "sources/sunday.jpg"
};

// --- 2. BANNER CONFIGURATION (Updated with 4 Images Each) ---
const bannerConfig = {
    'Electronics': {
        title: "Future Tech",
        desc: "Upgrade your life with the latest gadgets.",
        images: [
            "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&q=80",
            "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80",
            "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80",
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"
        ]
    },
    'Mens Fashion': {
    title: "Men's Edit",
    desc: "Urban essentials and winter wear for him.",
    images: [
        "https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=800",
        "https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=800"
    ]
},
'Womens Fashion': {
    title: "Women's Luxe",
    desc: "Trending styles and winter favorites for her.",
    images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
        "https://images.unsplash.com/photo-1534774592507-488885376ad3?w=800"
    ]
},
    'Fashion': {
        title: "Trend Setter",
        desc: "Style that speaks without words.",
        images: [
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
        ]
    },
    'Beauty': {
        title: "Glow Up",
        desc: "Enhance your natural beauty.",
        images: [
            "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
            "https://images.unsplash.com/photo-1522335789203-abd652322ed8?w=800&q=80",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80",
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80"
        ]
    },
    'Appliances': {
        title: "Smart Home",
        desc: "Efficiency meets innovation.",
        images: [
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
            "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80",
            "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80"
        ]
    },
    'Toys': {
        title: "Play Time",
        desc: "Fun and learning for every age.",
        images: [
            "https://images.unsplash.com/photo-1558877385-81a1c7e67d1d?w=800&q=80",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
            "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80"
        ]
    },
    'Grocery': {
        title: "Fresh Daily",
        desc: "Organic and fresh essentials.",
        images: [
            "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
            "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
            "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80",
            "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80"
        ]
    },
    'Mobiles': {
        title: "Pocket Power",
        desc: "Stay connected, stay ahead.",
        images: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff23?w=800&q=80",
            "https://images.unsplash.com/photo-1556656793-02715d8dd660?w=800&q=80",
            "https://images.unsplash.com/photo-1533228126398-39c2947e4d7b?w=800&q=80"
        ]
    },
    'Laptops': {
        title: "Workstation",
        desc: "Power your productivity.",
        images: [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
            "https://images.unsplash.com/photo-1531297420492-604749b8b031?w=800&q=80",
            "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80",
            "https://images.unsplash.com/photo-1588872657578-a3d8919b9b43?w=800&q=80"
        ]
    },
    'Furniture': {
        title: "Interior Art",
        desc: "Design your perfect space.",
        images: [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
            "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80"
        ]
    },
    'Sports': {
        title: "Active Life",
        desc: "Gear up for the win.",
        images: [
            "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
            "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80"
        ]
    },
    'Footwear': {
        title: "Walk Tall",
        desc: "Comfort for every step.",
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"
        ]
    },
    'Watches': {
        title: "Timeless",
        desc: "Luxury on your wrist.",
        images: [
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
            "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80",
            "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
            "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80"
        ]
    },
    'Jewellery': {
        title: "Elegance",
        desc: "Shine bright like a diamond.",
        images: [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
            "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80"
        ]
    },
    'Bags': {
        title: "Carry Style",
        desc: "Fashion meets function.",
        images: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"
        ]
    },
    'Kitchen': {
        title: "Master Chef",
        desc: "Cook with passion.",
        images: [
            "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80",
            "https://images.unsplash.com/photo-1556912173-3db9963f6bee?w=800&q=80",
            "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
        ]
    },
    'Baby Care': {
        title: "Little Ones",
        desc: "Only the best for your baby.",
        images: [
            "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
            "https://images.unsplash.com/photo-1522771753035-4a50094a167e?w=800&q=80",
            "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80",
            "https://images.unsplash.com/photo-1544126566-47443899bdb0?w=800&q=80"
        ]
    },
    'Automotive': {
        title: "On The Road",
        desc: "Essentials for your vehicle.",
        images: [
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
            "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
            "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
            "https://images.unsplash.com/photo-1503376763036-066120622c74?w=800&q=80"
        ]
    },
    'Books': {
        title: "Read More",
        desc: "Stories that inspire.",
        images: [
            "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
            "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80",
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80"
        ]
    },
    'Stationery': {
        title: "Create",
        desc: "Tools for your imagination.",
        images: [
            "https://images.unsplash.com/photo-1456735190827-d1261f794971?w=800&q=80",
            "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80",
            "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80",
            "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?w=800&q=80"
        ]
    }
};
// --- 3. INITIALIZATION & EVENTS ---
document.addEventListener('DOMContentLoaded', async () => {
    if (window.lucide) lucide.createIcons();

    // Load Products
    initHomeSlideshowLogic();
    products = await loadAllProducts();

    // Initial UI Setup
    loadState();
    renderProducts();
    updateAllUI();
    init360View();

    // Start Hero Video Cycle
    initHeroCycle();

    // Start Trending Observer
    initTrendingObserver();

    // Start Sunday Logic
    initSundayStatus();
});

// --- 4. CORE FUNCTIONS ---

async function loadAllProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error("Backend not connected");
        const data = await res.json();

        const MARKUP_FEE = 25;

        return data.map(item => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price) + MARKUP_FEE,
            originalPrice: parseFloat(item.price),
            brand: item.brand,
            category: item.category,
            subCategory: item.subCategory,
            tags: item.tags || [],
            img: item.image,
            images: (item.images && item.images.length > 0) ? item.images : [item.image],
            description: item.description,
            sizes: item.sizes,
            stock: parseInt(item.stock || 0), // <--- YAHAN COMMA (,) HONA ZAROORI HAI
            shopName: item.shopName || "KICKS OFFICIAL STORE" // Database se asli naam aayega
        }));
    } catch (error) {
        console.warn("Failed to load products", error);
        return [];
    }
}
// Format Currency
const formatMoney = (amount) => "₹" + amount.toLocaleString('en-IN');

// Date Parsing
const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('/');
    return new Date(`${month}/${day}/${year}`);
};

// Return Window Logic
const isReturnWindowOpen = (dateStr) => {
    const orderDate = parseDate(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
};

// Toast Notification
const showToast = (msg) => {
    const t = document.getElementById('toast');
    if (!t) return;
    document.getElementById('toast-msg').innerText = msg;
    t.classList.remove('opacity-0');
    setTimeout(() => t.classList.add('opacity-0'), 2500);
};

// --- 5. STATE MANAGEMENT ---

const saveState = async () => {
    if (state.user) {
        localStorage.setItem('kicks_user_session', JSON.stringify(state.user));

        try {
            await fetch(`${API_URL}/user/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: state.user.email,
                    cart: state.cart,
                    wishlist: state.wishlist
                })
            });
        } catch (e) { console.error("Sync failed", e); }
    }
};

const loadState = () => {
    const session = localStorage.getItem('kicks_user_session');
    if (session) {
        state.user = JSON.parse(session);
        state.cart = state.user.cart || [];
        state.wishlist = state.user.wishlist || [];
        fetchUserOrders();
    }
};

async function fetchUserOrders() {
    if (!state.user) return;
    try {
        const res = await fetch(`${API_URL}/orders/${state.user.email}`);
        state.orders = await res.json();
        if (document.getElementById('view-orders').classList.contains('active')) renderOrders();
    } catch (e) { console.error(e); }
}

// --- 6. NAVIGATION & UI ---

function navigate(view) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay-backdrop');
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');

    // Updated navigation logic: Allow 'categories' and 'play' without login
    if (view !== 'home' && view !== 'listing' && view !== 'categories' && view !== 'profile' && !state.user) {
        openAuth('login');
        return;
    }
    if (view === 'profile' && !state.user) { openAuth('login'); return; }
    if (view === 'listing') { openListing('all', ''); return; }
    switchView(view);
}
function switchView(viewName) {
    // 1. पेज को ऊपर स्क्रॉल करें
    window.scrollTo({ top: 0, behavior: 'auto' });

    // 2. नीचे के नेविगेशन बार का रंग बदलें
    updateBottomNav(viewName);

    // 3. कैटेगरी हेडर छुपाएं/दिखाएं
    const topHeader = document.getElementById('category-header');
    if (topHeader) {
        viewName === 'home' ? topHeader.classList.remove('hidden') : topHeader.classList.add('hidden');
    }

    // 4. सभी पुराने सेक्शन्स को छुपाएं
    const allViews = document.querySelectorAll('.section-view');
    allViews.forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none'; // इनलाइन स्टाइल साफ़ करें
    });

    // 5. डेटा रिफ्रेश करें (Cart/Orders/Wishlist)
    if (viewName === 'cart') renderCart();
    if (viewName === 'wishlist') renderWishlist();
    if (viewName === 'orders') { fetchUserOrders(); renderOrders(); }
    if (viewName === 'profile') renderProfile();

    // 6. टारगेट सेक्शन को दिखाएं
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
        target.style.display = 'block'; // पहले डिस्प्ले ब्लॉक करें
        setTimeout(() => {
            target.classList.add('active'); // फिर एनिमेशन क्लास जोड़ें
            if (window.lucide) lucide.createIcons();
        }, 50);
    }
}

// updateBottomNav function (Ensure it is defined but NOT called globally)
function updateBottomNav(viewName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active', 'text-brand-pink'));
    const activeBtn = document.getElementById(`nav-${viewName}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'text-brand-pink');
    }
}
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay-backdrop');
    const isClosed = sidebar.classList.contains('-translate-x-full');
    if (isClosed) { sidebar.classList.remove('-translate-x-full'); overlay.classList.remove('hidden'); }
    else { sidebar.classList.add('-translate-x-full'); overlay.classList.add('hidden'); }
}

function closeAllOverlays() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('overlay-backdrop').classList.add('hidden');
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('register-box').classList.add('hidden');
    document.getElementById('login-box').classList.remove('opacity-100', 'scale-100');
    document.getElementById('register-box').classList.remove('opacity-100', 'scale-100');
    document.getElementById('tracking-modal').classList.add('hidden');
    document.getElementById('return-modal').classList.add('hidden');
    document.getElementById('checkout-modal').classList.add('hidden');
}

// --- 7. AUTHENTICATION ---

function openAuth(type) {
    document.getElementById('overlay-backdrop').classList.remove('hidden');
    document.getElementById('auth-modal').classList.remove('hidden');
    switchAuth(type);
}

function switchAuth(type) {
    const login = document.getElementById('login-box');
    const reg = document.getElementById('register-box');
    login.classList.add('hidden', 'opacity-0');
    reg.classList.add('hidden', 'opacity-0');
    const target = type === 'login' ? login : reg;
    target.classList.remove('hidden');
    setTimeout(() => { target.classList.remove('opacity-0', 'scale-95'); target.classList.add('opacity-100', 'scale-100'); }, 10);
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-pass').value;
    if (password.length < 6) { showToast("Password too short"); return; }

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (data.error) { showToast(data.error); return; }

        state.user = data;
        state.cart = [];
        state.wishlist = [];
        saveState();
        closeAllOverlays();
        updateAllUI();
        showToast("Account Created!");
    } catch (err) { showToast("Server Error"); }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.error) { showToast(data.error); return; }

        state.user = data;
        state.cart = data.cart || [];
        state.wishlist = data.wishlist || [];
        saveState();
        closeAllOverlays();
        updateAllUI();
        showToast("Welcome Back!");
        fetchUserOrders();
    } catch (err) { showToast("Login Failed"); }
}

function logout() {
    state.user = null; state.cart = []; state.wishlist = []; state.orders = [];
    localStorage.removeItem('kicks_user_session');
    toggleSidebar();
    updateAllUI();
    switchView('home');
    showToast("Signed Out");
}// index.js

function updateAllUI() {
    // Check karein ki user data exist karta hai aur usme email hai
    const hasUser = state.user && state.user.email;

    const userInfo = document.getElementById('sidebar-user-info');
    const guestInfo = document.getElementById('sidebar-guest-info');
    const logoutBtn = document.getElementById('sidebar-logout-btn');

    // --- FIX: Logout Button & Sections Visibility ---
    if (userInfo) userInfo.style.display = hasUser ? 'block' : 'none';
    if (guestInfo) guestInfo.style.display = hasUser ? 'none' : 'block';

    // IMPORTANT: Logout button ko force show karein agar user hai
    if (logoutBtn) {
        logoutBtn.style.display = hasUser ? 'block' : 'none';
    }

    if (hasUser) {
        // --- FIX: Safe Data Display (Fallback text lagaya hai) ---
        const safeName = state.user.name || "User";
        const safeEmail = state.user.email || ""; // Email missing ho to blank rakho

        const sidebarName = document.getElementById('sidebar-name');
        if (sidebarName) sidebarName.innerText = safeName;

        const sidebarEmail = document.getElementById('sidebar-email');
        if (sidebarEmail) sidebarEmail.innerText = safeEmail;

        // Avatar Logic
        const sidebarAv = document.getElementById('sidebar-avatar');
        if (sidebarAv) {
            if (state.user.picture) {
                sidebarAv.innerHTML = `<img src="${state.user.picture}" class="w-full h-full object-cover">`;
            } else {
                // Name ka pehla letter
                const letter = safeName.charAt(0).toUpperCase();
                sidebarAv.innerText = letter;
            }
        }
    }

    // --- Cart & Wishlist Counts Update (Baaki code same rahega) ---
    const cartCount = state.cart ? state.cart.length : 0;
    const wishCount = state.wishlist ? state.wishlist.length : 0;

    const headerCart = document.getElementById('header-cart-count');
    const sidebarCart = document.getElementById('sidebar-cart-count');
    const bottomCart = document.getElementById('bottom-cart-count');

    if (headerCart) {
        headerCart.innerText = cartCount;
        headerCart.classList.toggle('hidden', cartCount === 0);
    }
    if (sidebarCart) {
        sidebarCart.innerText = cartCount;
        sidebarCart.classList.toggle('hidden', cartCount === 0);
    }
    if (bottomCart) {
        bottomCart.innerText = cartCount;
        bottomCart.classList.toggle('hidden', cartCount === 0);
    }

    const wishDot = document.getElementById('header-wishlist-dot');
    if (wishDot) wishDot.classList.toggle('hidden', wishCount === 0);

    const sidebarWish = document.getElementById('sidebar-wishlist-count');
    if (sidebarWish) {
        sidebarWish.innerText = wishCount;
        sidebarWish.classList.toggle('hidden', wishCount === 0);
    }
}
// Update navigate/switchView to handle active tab color
function updateBottomNav(viewName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-${viewName}`);
    if (activeBtn) activeBtn.classList.add('active');
}


// --- 8. VOICE SEARCH (FIXED) ---
function startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Sorry, Voice Search is not supported in this browser.");
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onstart = function () {
        showToast("Listening... Speak now");
    };

    recognition.onresult = function (event) {
        let query = event.results[0][0].transcript;
        // Clean trailing punctuation
        query = query.replace(/[.,!?;:]+\s*$/, "").trim();

        document.getElementById('search-input').value = query;
        handleSearch(query);
    };

    recognition.onerror = function (event) {
        console.error("Voice error", event.error);
        showToast("Could not hear you. Try again.");
    };
}

// --- 9. HERO VIDEO & TRENDING ---
function initHeroCycle() {
    const poster = document.getElementById("heroPoster");
    const video = document.getElementById("heroVideo");
    const textOverlay = document.getElementById("heroText");

    if (!poster || !video || !textOverlay) return;

    video.classList.remove("hidden");

    function startHeroCycle() {
        // Reset 
        poster.classList.remove("opacity-0");
        textOverlay.classList.remove("opacity-0");

        video.pause();
        video.currentTime = 0;

        setTimeout(() => {
            const playPromise = video.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Fade out poster and text on success
                    poster.classList.add("opacity-0");
                    textOverlay.classList.add("opacity-0");
                })
                    .catch(error => {
                        console.error("Video play failed:", error);
                    });
            }
        }, 2500);
    }

    video.onended = function () {
        startHeroCycle();
    };

    startHeroCycle();
}

function initTrendingObserver() {
    const grid = document.getElementById('product-grid');
    if (grid) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            node.classList.add('enhanced-product-card', 'group');
                            const img = node.querySelector('img');
                            if (img) img.classList.add('object-cover');

                            const badge = document.createElement('div');
                            badge.className = 'absolute top-3 left-3 fire-badge z-20';
                            badge.innerHTML = '<i data-lucide="flame" class="w-3 h-3"></i> HOT';
                            node.style.position = 'relative';
                            node.appendChild(badge);

                            if (window.lucide) lucide.createIcons();
                        }
                    });
                }
            });
        });
        observer.observe(grid, { childList: true });
    }
}

// --- 10. LISTING & SEARCH ---

function handleSearch(query) {
    const suggestionBox = document.getElementById('search-suggestions');
    const q = query.toLowerCase().trim();

    if (q.length < 1) {
        suggestionBox.classList.add('hidden');
        suggestionBox.innerHTML = '';
        return;
    }

    const matches = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 6);

    if (matches.length > 0) {
        suggestionBox.classList.remove('hidden');
        suggestionBox.innerHTML = `
            <div class="py-2">
                <p class="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</p>
                ${matches.map(p => `
                    <div onclick="selectSuggestion('${p.id}')" class="flex items-center gap-4 px-4 py-3 hover:bg-purple-50 cursor-pointer transition border-b border-gray-50 last:border-0">
                        <img src="${p.img}" class="w-10 h-10 rounded-lg object-cover bg-gray-100">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-sm text-gray-900 truncate">${highlightMatch(p.name, q)}</h4>
                            <p class="text-[10px] text-gray-500 uppercase">${p.brand} • ${p.category}</p>
                        </div>
                        <span class="font-bold text-xs text-purple-600">${formatMoney(p.price)}</span>
                    </div>
                `).join('')}
                <div onclick="openListing('search', '${query}'); closeSuggestions();" class="px-4 py-3 bg-gray-50 text-center cursor-pointer hover:bg-purple-600 hover:text-white transition group">
                    <span class="text-xs font-bold">View all results for "${query}"</span>
                </div>
            </div>
        `;
    } else {
        suggestionBox.classList.remove('hidden');
        suggestionBox.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <p class="text-sm">No products found for "<b>${query}</b>"</p>
            </div>
        `;
    }
} // Fixed: Added missing closing brace

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="text-purple-600 bg-purple-100 px-0.5 rounded">$1</span>');
}

function selectSuggestion(id) {
    openProductPage(id);
    closeSuggestions();
    document.getElementById('search-input').value = "";
}

function closeSuggestions() {
    const suggestionBox = document.getElementById('search-suggestions');
    if (suggestionBox) suggestionBox.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.relative.group');
    if (searchContainer && !searchContainer.contains(e.target)) {
        closeSuggestions();
    }
});

function clearSearch() { document.getElementById('search-input').value = ""; activeFilters.search = ""; openListing('all', ''); }

/* --- REPLACE openListing FUNCTION IN index.js --- */

function openListing(filterType, mainValue, subValue = null) {
    // 1. Open the listing view (this triggers the scroll to top from Step 2)
    switchView('listing');

    // 2. Set Filters
    activeFilters.mainCat = (filterType === 'category') ? mainValue : null;
    activeFilters.subCat = subValue;
    activeFilters.search = (filterType === 'search') ? mainValue : "";

    if (filterType === 'all') {
        activeFilters.mainCat = null;
        activeFilters.subCat = null;
        activeFilters.search = "";
    }

    // 3. --- FIX: BANNER VISIBILITY LOGIC ---
    const banner = document.getElementById('dynamic-category-banner');

    if (filterType === 'search') {
        // CASE A: Searching -> HIDE BANNER STRICTLY
        if (banner) {
            banner.classList.add('hidden');
            banner.style.display = 'none'; // Double force hide
        }
        if (bannerInterval) clearInterval(bannerInterval);
    }
    else if (filterType === 'category' && bannerConfig[mainValue]) {
        // CASE B: Category -> SHOW BANNER
        if (banner) {
            banner.classList.remove('hidden');
            banner.style.display = 'block';
        }
        startCategoryBanner(mainValue);
    }
    else {
        // CASE C: All Products / Other -> HIDE BANNER
        if (banner) {
            banner.classList.add('hidden');
            banner.style.display = 'none';
        }
        if (bannerInterval) clearInterval(bannerInterval);
    }
    // ---------------------------------------

    // 4. Set Title
    let title = "Collection";
    if (activeFilters.search) title = `Results for: "${activeFilters.search}"`;
    else if (activeFilters.subCat) title = `${activeFilters.mainCat} > ${activeFilters.subCat}`;
    else if (activeFilters.mainCat) title = activeFilters.mainCat;

    document.getElementById('listing-title').innerText = title;

    // 5. Render Filters
    const relevantProducts = getFilteredProducts(true);
    const uniqueTags = [...new Set(relevantProducts.flatMap(p => p.tags || []))];
    const uniqueBrands = [...new Set(relevantProducts.map(p => p.brand))];

    const catContainer = document.getElementById('filter-categories');
    const brandContainer = document.getElementById('filter-brands');

    if (catContainer) {
        catContainer.innerHTML = uniqueTags.length > 0
            ? uniqueTags.map(t => `<label class="flex items-center gap-2 cursor-pointer hover:text-purple-600 transition"><input type="checkbox" onclick="renderListingGrid()" class="tag-check accent-purple-600"> ${t}</label>`).join('')
            : '<p class="text-xs text-gray-400">No specific filters</p>';
    }

    if (brandContainer) {
        brandContainer.innerHTML = uniqueBrands.map(b => `<label class="flex items-center gap-2 cursor-pointer hover:text-purple-600 transition"><input type="checkbox" onclick="renderListingGrid()" class="brand-check accent-purple-600"> ${b}</label>`).join('');
    }

    // 6. Render Grid
    renderListingGrid();
}
// Add this inside DOMContentLoaded or at the bottom of index.js
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const query = this.value;
            closeSuggestions();
            openListing('search', query); // This will now hide the banner due to Fix #2
        }
    });
}
function startCategoryBanner(category) {
    const config = bannerConfig[category];
    const container = document.getElementById('dynamic-category-banner');
    const slidesContainer = document.getElementById('banner-slides-container');
    const titleEl = document.getElementById('banner-title');
    const descEl = document.getElementById('banner-desc');
    const progressEl = document.getElementById('banner-progress');

    if (!container) return;
    container.classList.remove('hidden');

    titleEl.innerText = config.title;
    descEl.innerText = config.desc;

    if (bannerInterval) clearInterval(bannerInterval);

    slidesContainer.innerHTML = config.images.map((img, i) =>
        `<img src="${img}" class="absolute inset-0 w-full h-full object-cover banner-slide ${i === 0 ? 'opacity-100' : 'opacity-0'}" id="banner-slide-${i}">`
    ).join('');

    let currentSlide = 0;

    progressEl.style.transition = 'none';
    progressEl.style.width = '0%';
    setTimeout(() => {
        progressEl.style.transition = 'width 3s linear';
        progressEl.style.width = '100%';
    }, 50);

    bannerInterval = setInterval(() => {
        const curr = document.getElementById(`banner-slide-${currentSlide}`);
        if (curr) {
            curr.classList.remove('opacity-100');
            curr.classList.add('opacity-0');
        }

        currentSlide = (currentSlide + 1) % config.images.length;

        const next = document.getElementById(`banner-slide-${currentSlide}`);
        if (next) {
            next.classList.remove('opacity-0');
            next.classList.add('opacity-100');
        }

        progressEl.style.transition = 'none';
        progressEl.style.width = '0%';
        setTimeout(() => {
            progressEl.style.transition = 'width 3s linear';
            progressEl.style.width = '100%';
        }, 50);

    }, 3000);
}

function getFilteredProducts(ignoreSidebars = false) {
    return products.filter(p => {
        const matchMain = !activeFilters.mainCat || p.category === activeFilters.mainCat;
        const matchSub = !activeFilters.subCat || p.subCategory === activeFilters.subCat;

        const matchSearch = activeFilters.search === "" ||
            p.name.toLowerCase().includes(activeFilters.search) ||
            p.brand.toLowerCase().includes(activeFilters.search) ||
            (p.category && p.category.toLowerCase().includes(activeFilters.search));

        if (ignoreSidebars) return matchMain && matchSub && matchSearch;

        const brandChecks = Array.from(document.querySelectorAll('.brand-check:checked')).map(cb => cb.parentNode.innerText.trim());
        const tagChecks = Array.from(document.querySelectorAll('.tag-check:checked')).map(cb => cb.parentNode.innerText.trim());

        const matchesBrand = brandChecks.length === 0 || brandChecks.includes(p.brand);
        const matchesTags = tagChecks.length === 0 || (p.tags && p.tags.some(t => tagChecks.includes(t)));

        return matchMain && matchSub && matchSearch && matchesBrand && matchesTags;
    });
}

function renderListingGrid() {
    let filtered = getFilteredProducts();

    document.getElementById('listing-count').innerText = `${filtered.length} ITEMS`;
    const grid = document.getElementById('listing-grid');

    grid.innerHTML = filtered.length === 0 ? `<div class="col-span-full text-center py-12 text-gray-400">No products found.</div>` : filtered.map(p => {
        const isWish = state.wishlist.includes(p.id);
        return `
        <div onclick="openProductPage(${p.id})" class="bg-white p-4 rounded-3xl border border-gray-100 product-card group cursor-pointer relative overflow-hidden">
            <button onclick="event.stopPropagation(); toggleWishlist(${p.id})" class="absolute top-4 right-4 z-30 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition">
                <i data-lucide="heart" class="w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : 'text-gray-400'}"></i>
            </button>
            
            <div class="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden relative">
                <img src="${p.img}" class="w-full h-full object-cover">
            </div>
            <div>
                <div class="flex justify-between items-start">
                    <p class="text-[10px] font-bold text-purple-600 uppercase mb-1 tracking-wider">${p.brand}</p>
                    <p class="text-[10px] text-gray-400 uppercase">${p.subCategory || p.category || ''}</p>
                </div>
                <h3 class="font-bold text-lg leading-tight mb-2 text-gray-900 truncate">${p.name}</h3>
                <span class="font-bold text-lg text-gray-500">${formatMoney(p.price)}</span>
            </div>
        </div>
    `}).join('');
    if (window.lucide) lucide.createIcons();
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    if (products.length === 0) { grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10">Loading products...</div>'; return; }

    grid.innerHTML = products.slice(0, 4).map((p, i) => {
        const isWish = state.wishlist.includes(p.id);
        return `
        <div onclick="openProductPage(${p.id})" class="bg-white p-4 rounded-3xl border border-gray-100 product-card group cursor-pointer relative overflow-hidden" style="animation-delay: ${i * 100}ms">
            <button onclick="event.stopPropagation(); toggleWishlist(${p.id})" class="absolute top-4 right-4 z-30 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                <i data-lucide="heart" class="w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : 'text-gray-400'}"></i>
            </button>
            <div class="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden">
                <img src="${p.img}" class="w-full h-full object-cover">
            </div>
            <div>
                <p class="text-xs font-bold text-purple-600 uppercase mb-1 tracking-wider">${p.brand}</p>
                <h3 class="font-bold text-lg leading-tight mb-2 text-gray-900">${p.name}</h3>
                <span class="font-bold text-lg text-gray-500">${formatMoney(p.price)}</span>
            </div>
        </div>
    `}).join('');
    if (window.lucide) lucide.createIcons();
}

// --- 11. PRODUCT DETAILS (PDP) ---

function openProductPage(id) {
    const product = products.find(p => p.id == id);

    if (!product) {
        console.error("Product not found for ID:", id);
        return;
    }

    state.currentProductId = product.id;
    state.selectedSize = null;
    state.currentImageIndex = 0;
    state.currentQuantity = 1;
    addToRecent(product);
    switchView('product');

    document.getElementById('pdp-main-img').src = product.images[0] || product.img;
    const thumb0 = document.getElementById('thumb-0'); if (thumb0) thumb0.src = product.images[0] || product.img;
    const thumb1 = document.getElementById('thumb-1'); if (thumb1) thumb1.src = product.images[1] || product.img;
    const thumb2 = document.getElementById('thumb-2'); if (thumb2) thumb2.src = product.images[2] || product.img;
    resetThumbBorders(0);

    document.getElementById('pdp-brand').innerText = product.brand;
    document.getElementById('pdp-title').innerText = product.name;
    document.getElementById('pdp-price').innerText = formatMoney(product.price);
    document.getElementById('pdp-desc').innerText = product.description || "No description provided.";
    document.getElementById('pdp-qty-display').innerText = "1";

    const inStock = product.stock > 0;
    const stockBadge = document.getElementById('pdp-stock-badge');
    const stockOverlay = document.getElementById('pdp-out-of-stock-overlay');
    const btnAdd = document.getElementById('btn-add-cart');
    const btnBuy = document.getElementById('btn-buy-now');

    if (inStock) {
        stockBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase";
        stockBadge.innerText = "In Stock";
        stockOverlay.classList.add('hidden');
        btnAdd.disabled = false; btnAdd.classList.remove('opacity-50', 'cursor-not-allowed');
        btnBuy.disabled = false; btnBuy.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        stockBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500 border border-red-200 uppercase";
        stockBadge.innerText = "Out of Stock";
        stockOverlay.classList.remove('hidden');
        btnAdd.disabled = true; btnAdd.classList.add('opacity-50', 'cursor-not-allowed');
        btnBuy.disabled = true; btnBuy.classList.add('opacity-50', 'cursor-not-allowed');
    }

const isWish = state.wishlist.includes(id);
const wishlistBtn = document.getElementById('pdp-wishlist-btn');
wishlistBtn.setAttribute('onclick', `toggleWishlist(${id})`); // Yeh line click function add karegi
wishlistBtn.innerHTML = `<i data-lucide="heart" class="w-6 h-6 ${isWish ? 'fill-red-500 text-red-500' : 'text-gray-400'}"></i>`;

    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];
    const sizeContainer = document.getElementById('pdp-sizes');

    if (!inStock) {
        sizeContainer.innerHTML = '<span class="col-span-full text-gray-500 text-sm italic">Sizes currently unavailable</span>';
    } else {
        sizeContainer.innerHTML = availableSizes.map(s => `
            <button type="button" onclick="selectSize(this, '${s}')" class="size-btn py-3 rounded-lg border border-gray-200 font-bold text-gray-500 hover:border-purple-600 hover:text-purple-600 transition bg-white">${s}</button>
        `).join('');
    }
    document.getElementById('size-error').classList.add('hidden');
    renderRecommendations(product);
    renderReviews(product.id);
    if (window.lucide) lucide.createIcons();
}

function init360View() {
    const container = document.getElementById('pdp-img-container');
    if (!container) return;
    let isDragging = false;
    let startX = 0;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        container.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'ew-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !state.currentProductId) return;
        const diff = e.clientX - startX;
        if (Math.abs(diff) > 50) {
            const product = products.find(p => p.id === state.currentProductId);
            if (product && product.images.length > 0) {
                if (diff > 0) state.currentImageIndex = (state.currentImageIndex + 1) % 3;
                else state.currentImageIndex = (state.currentImageIndex - 1 + 3) % 3;
                swapMainImage(state.currentImageIndex);
                startX = e.clientX;
            }
        }
    });
}

function swapMainImage(index) {
    state.currentImageIndex = index;
    const product = products.find(p => p.id === state.currentProductId);
    if (product && product.images[index]) {
        document.getElementById('pdp-main-img').src = product.images[index];
        resetThumbBorders(index);
    }
}

function resetThumbBorders(activeIndex) {
    [0, 1, 2].forEach(i => {
        const el = document.getElementById(`thumb-container-${i}`);
        if (el) {
            if (i === activeIndex) el.classList.add('border-2', 'border-purple-600');
            else el.classList.remove('border-2', 'border-purple-600');
        }
    });
}
// --- ADD THIS TO index.js ---

const categoryContainer = document.getElementById('category-header');

if (categoryContainer) {
    categoryContainer.addEventListener('wheel', (evt) => {
        evt.preventDefault();
        // Adjust scrolling speed by changing 3
        categoryContainer.scrollLeft += evt.deltaY * 3;
    });
}

function renderRecommendations(currentProduct) {
    const container = document.getElementById('pdp-recommendations');
    const recs = products.filter(p =>
        (p.category === currentProduct.category || p.brand === currentProduct.brand) && p.id !== currentProduct.id
    ).slice(0, 4);

    if (recs.length === 0) { container.innerHTML = '<p class="text-gray-400 col-span-full">No recommendations available.</p>'; return; }

    container.innerHTML = recs.map(p => `
        <div onclick="openProductPage(${p.id})" class="bg-white p-4 rounded-3xl border border-gray-100 group cursor-pointer hover:shadow-lg transition">
            <div class="aspect-square bg-gray-50 rounded-2xl mb-3 overflow-hidden">
                <img src="${p.img}" class="w-full h-full object-cover">
            </div>
            <div>
                <h3 class="font-bold text-sm text-gray-900 truncate">${p.name}</h3>
                <p class="text-xs font-bold text-purple-600">${formatMoney(p.price)}</p>
            </div>
        </div>
    `).join('');
}

// index.js: Is function ko replace karein
async function renderReviews(productId) {
    const list = document.getElementById('pdp-reviews-list');
    const barsContainer = document.getElementById('rating-bars-container');
    const photoSection = document.getElementById('real-photos-section');
    const topAvgEl = document.getElementById('pdp-rating-avg');
    const topCountEl = document.getElementById('pdp-rating-total-count');

    try {
        const res = await fetch(`${API_URL}/reviews/${productId}`);
        const reviews = await res.json();

        // --- AGAR REVIEW NAHI HAI (EMPTY STATE) ---
        if (!reviews || reviews.length === 0) {
            list.innerHTML = '<div class="text-center py-10 text-gray-400 italic">No reviews yet. Be the first to rate!</div>';
            
            // Sabhi values ko 0 karein
            if(topAvgEl) topAvgEl.innerText = "0.0";
            if(topCountEl) topCountEl.innerText = "(0)";
            document.getElementById('avg-rating-val').innerText = "0.0";
            document.getElementById('total-ratings-count').innerText = "0 Ratings";
            document.getElementById('total-reviews-count').innerText = "0";
            
            // Bars aur Photos ko gayab karein
            barsContainer.innerHTML = ""; 
            photoSection.classList.add('hidden');
            return;
        }

        // --- AGAR REVIEW HAIN TOH CALCULATION KAREIN ---
        let totalRating = 0;
        let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let allImages = [];

        reviews.forEach(r => {
            totalRating += r.rating;
            distribution[r.rating]++;
            if (r.image) allImages.push(r.image);
        });

        const actualCount = reviews.length;
        const avg = (totalRating / actualCount).toFixed(1);

        // UI Update
        if(topAvgEl) topAvgEl.innerText = avg;
        if(topCountEl) topCountEl.innerText = `(${actualCount})`;
        document.getElementById('avg-rating-val').innerText = avg;
        document.getElementById('total-ratings-count').innerText = `${actualCount} Ratings`;

        // Render Bars
        barsContainer.innerHTML = [5, 4, 3, 2, 1].map(num => {
            const pct = (distribution[num] / actualCount) * 100;
            const barColor = num >= 4 ? 'bg-green-500' : (num === 3 ? 'bg-yellow-400' : 'bg-red-400');
            return `
                <div class="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                    <span class="w-12">${num} Stars</span>
                    <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full ${barColor}" style="width: ${pct}%"></div>
                    </div>
                    <span class="w-8 text-right text-gray-400">${distribution[num]}</span>
                </div>`;
        }).join('');

        // Photo Gallery Update
        if (allImages.length > 0) {
            photoSection.classList.remove('hidden');
            document.getElementById('pdp-photo-gallery').innerHTML = allImages.map(img => `
                <img src="${img}" class="w-20 h-20 rounded-xl object-cover border border-gray-100 flex-shrink-0">
            `).join('');
        } else {
            photoSection.classList.add('hidden');
        }

        // Individual Reviews Render (Sahi style mein)
        list.innerHTML = reviews.map(r => `
            <div class="border-b border-gray-50 pb-6 last:border-0">
                <div class="flex items-center gap-2 mb-2">
                    <span class="${r.rating >= 4 ? 'bg-green-600' : 'bg-red-500'} text-white px-2 py-0.5 rounded text-[10px] font-bold">${r.rating} ★</span>
                    <span class="font-bold text-sm text-gray-900">${r.user}</span>
                    <span class="text-[10px] text-gray-400 ml-auto">${r.date}</span>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed">${r.text}</p>
                ${r.image ? `<img src="${r.image}" class="mt-3 w-24 h-24 rounded-2xl object-cover border border-gray-100">` : ''}
            </div>
        `).join('');

        if (window.lucide) lucide.createIcons();

    } catch (e) {
        console.error("Review Load Error:", e);
    }
}
// 1. Voice Synthesis Function
function speakGuide(text) {
    window.speechSynthesis.cancel(); // Pehle wala stop karein
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.rate = 0.9; // Normal speed
    msg.pitch = 1.1; // Slightly feminine
    
    // Female voice select karne ka try karein
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female'));
    if (femaleVoice) msg.voice = femaleVoice;
    
    window.speechSynthesis.speak(msg);
}

// 2. Trust Guide Function (Meesho Style)
function showTrustGuide(type) {
    const modal = document.getElementById('guide-modal');
    const content = document.getElementById('guide-content');
    const title = document.getElementById('guide-title');
    modal.classList.remove('hidden');

    let steps = [];
    let voiceText = "";

    if (type === 'return') {
        title.innerText = "7 Days Easy Returns";
        voiceText = "You can return this product for free within 7 days. Our agent will pick it up in 2 to 3 days and you will get a full refund within 24 hours.";
        steps = [
            { icon: 'package-check', text: 'Free returns in 7 days', color: 'text-green-600' },
            { icon: 'truck', text: 'Pickup in 2-3 days', color: 'text-blue-600' },
            { icon: 'circle-dollar-sign', text: 'Refund within 24 hours', color: 'text-purple-600' }
        ];
    } else if (type === 'cod') {
        title.innerText = "Cash On Delivery";
        voiceText = "Pay for your order at your doorstep when it arrives. No advance payment is needed.";
        steps = [
            { icon: 'wallet', text: 'No advance payment', color: 'text-amber-600' },
            { icon: 'hand-coins', text: 'Pay at doorstep', color: 'text-green-600' }
        ];
    } else {
        title.innerText = "Lowest Price Guarantee";
        voiceText = "This product is available at the lowest market price only at Kicks India.";
        steps = [
            { icon: 'trending-down', text: 'Best Price Found', color: 'text-pink-600' },
            { icon: 'award', text: 'Verified Quality', color: 'text-purple-600' }
        ];
    }

    content.innerHTML = steps.map((s, i) => `
        <div class="flex items-center gap-6 group">
            <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${s.color} border border-gray-100 shadow-sm">
                <i data-lucide="${s.icon}" class="w-6 h-6"></i>
            </div>
            <div class="flex-1">
                <p class="font-black text-gray-800 text-sm uppercase tracking-tight">${s.text}</p>
                <div class="w-full h-1 bg-gray-100 mt-2 rounded-full"><div class="h-full bg-green-500 w-full rounded-full transition-all duration-1000"></div></div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
    speakGuide(voiceText);
}

function closeGuide() {
    document.getElementById('guide-modal').classList.add('hidden');
    window.speechSynthesis.cancel();
}
async function openProductPage(id) {
    const product = products.find(p => p.id == id);

    if (!product) {
        console.error("Product not found for ID:", id);
        return;
    }

    // State Reset
    state.currentProductId = product.id;
    state.selectedSize = null;
    state.currentImageIndex = 0;
    state.currentQuantity = 1;
    addToRecent(product);
    switchView('product');

    // 1. Basic Details & Images
    document.getElementById('pdp-main-img').src = product.images[0] || product.img;
    const thumb0 = document.getElementById('thumb-0'); if (thumb0) thumb0.src = product.images[0] || product.img;
    const thumb1 = document.getElementById('thumb-1'); if (thumb1) thumb1.src = product.images[1] || product.img;
    const thumb2 = document.getElementById('thumb-2'); if (thumb2) thumb2.src = product.images[2] || product.img;
    resetThumbBorders(0);

    document.getElementById('pdp-brand').innerText = product.brand;
    document.getElementById('pdp-title').innerText = product.name;
    document.getElementById('pdp-price').innerText = formatMoney(product.price);
    document.getElementById('pdp-desc').innerText = product.description || "No description provided.";
    document.getElementById('pdp-qty-display').innerText = "1";

    // 2. Vendor Shop Name
    const vendorEl = document.getElementById('pdp-vendor-shop-name');
    if (vendorEl) vendorEl.innerText = product.shopName || "KICKS OFFICIAL STORE";

    // 3. Stock Badge & Buttons
    const inStock = product.stock > 0;
    const stockBadge = document.getElementById('pdp-stock-badge');
    const stockOverlay = document.getElementById('pdp-out-of-stock-overlay');
    const btnAdd = document.getElementById('btn-add-cart');
    const btnBuy = document.getElementById('btn-buy-now');

    if (inStock) {
        stockBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase";
        stockBadge.innerText = "In Stock";
        if(stockOverlay) stockOverlay.classList.add('hidden');
        btnAdd.disabled = false; btnAdd.classList.remove('opacity-50', 'cursor-not-allowed');
        btnBuy.disabled = false; btnBuy.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        stockBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500 border border-red-200 uppercase";
        stockBadge.innerText = "Out of Stock";
        if(stockOverlay) stockOverlay.classList.remove('hidden');
        btnAdd.disabled = true; btnAdd.classList.add('opacity-50', 'cursor-not-allowed');
        btnBuy.disabled = true; btnBuy.classList.add('opacity-50', 'cursor-not-allowed');
    }

    // --- FIX: WISHLIST BUTTON HANDLER ---
    const isWish = state.wishlist.includes(Number(id));
    const wishlistBtn = document.getElementById('pdp-wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.setAttribute('onclick', `toggleWishlist(${id})`); // Click event add kiya
        wishlistBtn.innerHTML = `<i data-lucide="heart" class="w-6 h-6 ${isWish ? 'fill-red-500 text-red-500' : 'text-gray-400'}"></i>`;
    }

    // 5. Sizes Logic
    const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];
    const sizeContainer = document.getElementById('pdp-sizes');
    if (sizeContainer) {
        sizeContainer.innerHTML = availableSizes.map(s => `
            <button type="button" onclick="selectSize(this, '${s}')" class="size-btn py-3 rounded-lg border border-gray-200 font-bold text-gray-500 hover:border-purple-600 hover:text-purple-600 transition bg-white">${s}</button>
        `).join('');
    }

    // 6. Accurate Rating & Reviews
    renderReviews(product.id);
    renderRecommendations(product);

    if (window.lucide) lucide.createIcons();
    window.scrollTo(0, 0);
}
async function submitReview(e) {
    e.preventDefault();
    if (!state.user) { showToast("Please login first"); return; }

    const text = document.getElementById('review-text').value;
    const rating = document.getElementById('review-rating').value;
    const imgInput = document.getElementById('review-image');

    const saveReview = async (imgData) => {
        const newReview = {
            productId: state.currentProductId,
            user: state.user.name,
            email: state.user.email,
            rating: parseInt(rating),
            text: text,
            image: imgData,
            date: new Date().toLocaleDateString('en-IN')
        };

        try {
            await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReview)
            });
            showToast("Review Posted Successfully!");
            document.getElementById('review-text').value = '';
            document.getElementById('review-image').value = '';
            renderReviews(state.currentProductId);
        } catch (e) {
            console.error(e);
            showToast("Failed to post review");
        }
    };

    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) { saveReview(event.target.result); }
        reader.readAsDataURL(imgInput.files[0]);
    } else { saveReview(null); }
}

async function renderUserReviews() {
    if (!state.user) return;
    const list = document.getElementById('my-reviews-list');
    if (!list) return;

    list.innerHTML = '<p class="text-gray-400 text-center py-10">Loading your reviews...</p>';

    try {
        const res = await fetch(`${API_URL}/reviews/user/${state.user.email}`);
        const reviews = await res.json();

        if (reviews.length === 0) {
            list.innerHTML = `
                <div class="text-center py-20">
                    <i data-lucide="star-off" class="w-12 h-12 text-gray-300 mx-auto mb-4"></i>
                    <p class="text-gray-400">You haven't written any reviews yet.</p>
                </div>`;
        } else {
            list.innerHTML = reviews.map(r => {
                const product = products.find(p => p.id === r.productId);
                const prodName = product ? product.name : `Product ID: ${r.productId}`;
                const prodImg = product ? product.img : '';

                return `
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div class="flex items-center gap-4 min-w-[200px]">
                        ${prodImg ? `<img src="${prodImg}" class="w-16 h-16 rounded-lg object-cover bg-gray-50">` : ''}
                        <div>
                            <h4 class="font-bold text-sm text-gray-900 line-clamp-1">${prodName}</h4>
                            <div class="text-amber-400 text-xs mt-1">{'★'.repeat(r.rating) + '☆'.repeat(5-r.rating)}</div>
                            <span class="text-[10px] text-gray-400">${r.date}</span>
                        </div>
                    </div>
                    <div class="flex-1">
                        <p class="text-gray-600 text-sm mb-3">"${r.text}"</p>
                        ${r.image ? `<img src="${r.image}" class="w-24 h-24 rounded-lg object-cover border border-gray-200 cursor-pointer hover:scale-105 transition">` : ''}
                    </div>
                </div>
                `;
            }).join('');
        }
        if (window.lucide) lucide.createIcons();
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="text-red-500 text-center">Failed to load reviews.</p>';
    }
}

// --- 13. PROFILE ---

function renderProfile() {
    if (!state.user) return;
    document.getElementById('profile-display-name').innerText = state.user.name;
    document.getElementById('profile-display-email').innerText = state.user.email;
    document.getElementById('prof-name').value = state.user.name || '';
    document.getElementById('prof-mobile').value = state.user.mobile || '';
    document.getElementById('prof-address').value = state.user.address || '';
    document.getElementById('prof-city').value = state.user.city || '';
    document.getElementById('prof-state').value = state.user.state || '';
    document.getElementById('prof-pincode').value = state.user.pincode || '';

    const bigAv = document.getElementById('profile-avatar-big');
    if (state.user.picture) {
        bigAv.innerHTML = `<img src="${state.user.picture}" class="w-full h-full object-cover">`;
    } else {
        bigAv.innerText = state.user.name[0].toUpperCase();
    }
}

async function saveProfile(e) {
    e.preventDefault();
    const payload = {
        email: state.user.email,
        name: document.getElementById('prof-name').value,
        mobile: document.getElementById('prof-mobile').value,
        address: document.getElementById('prof-address').value,
        city: document.getElementById('prof-city').value,
        state: document.getElementById('prof-state').value,
        pincode: document.getElementById('prof-pincode').value
    };

    try {
        const res = await fetch(`${API_URL}/user/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const updatedUser = await res.json();

        state.user = updatedUser;
        saveState();
        renderProfile();
        updateAllUI();
        showToast("Profile Updated Successfully!");
    } catch (err) {
        showToast("Failed to update profile");
    }
}

// --- 14. CART & WISHLIST ---

function increaseQty() {
    state.currentQuantity++;
    updateQtyUI();
}

function decreaseQty() {
    if (state.currentQuantity > 1) {
        state.currentQuantity--;
        updateQtyUI();
    }
}

function updateQtyUI() {
    document.getElementById('pdp-qty-display').innerText = state.currentQuantity;
}

function updateQuantity(change) {
    const product = products.find(p => p.id === state.currentProductId);
    if (!product) return;

    state.currentQuantity += change;

    if (state.currentQuantity < 1) state.currentQuantity = 1;

    // STOCK CHECK
    if (state.currentQuantity > product.stock) {
        state.currentQuantity = product.stock;
        showToast(`Only ${product.stock} quantity available`);

        document.getElementById('btn-add-cart').disabled = true;
        document.getElementById('btn-buy-now').disabled = true;
    } else {
        document.getElementById('btn-add-cart').disabled = false;
        document.getElementById('btn-buy-now').disabled = false;
    }

    document.getElementById('pdp-qty-display').innerText = state.currentQuantity;
}
function selectSize(btn, size) {
    state.selectedSize = size;

    // 1. Reset ALL buttons to default style (Gray/White)
    document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.remove('active-size');

        // Remove Purple (Active) Classes
        b.classList.remove('bg-purple-600', 'text-white', 'border-purple-600');

        // Add Gray (Inactive) Classes
        b.classList.add('bg-white', 'text-gray-500', 'border-gray-200');
    });

    // 2. Highlight the CLICKED button (Purple)
    btn.classList.add('active-size');

    // Remove Gray (Inactive) Classes
    btn.classList.remove('bg-white', 'text-gray-500', 'border-gray-200');

    // Add Purple (Active) Classes
    btn.classList.add('bg-purple-600', 'text-white', 'border-purple-600');

    // 3. Hide Error Message if it was showing
    const errorMsg = document.getElementById('size-error');
    if (errorMsg) errorMsg.classList.add('hidden');
}
function validateSize() {
    if (!state.selectedSize) {
        const err = document.getElementById('size-error');
        err.classList.remove('hidden');
        document.getElementById('size-selector-container').classList.add('shake');
        setTimeout(() => document.getElementById('size-selector-container').classList.remove('shake'), 500);
        return false;
    }
    return true;
}

async function addToCart(id, size = null, silent = false) {
    if (!state.user) { openAuth('login'); return; }

    // 1. Real-time Stock Check
    try {
        // Fetch fresh product data from server
        const res = await fetch(`${API_URL}/products`);
        const allProducts = await res.json();
        const freshProduct = allProducts.find(p => p.id === id);

        if (!freshProduct) {
            showToast("Product no longer available");
            return;
        }

        // Check how many of this item are ALREADY in the cart
        const inCartCount = state.cart.filter(item => item.id === id).length;

        // Check availability
        if (freshProduct.stock <= inCartCount) {
            showToast(`Out of Stock! You have ${inCartCount} in cart.`);
            return; // Stop here, do not add
        }

        // 2. Add to Cart if valid
        const finalSize = size || "Standard";
        // We use freshProduct to ensure price/details are current
        const cartItem = {
            ...freshProduct,
            price: parseFloat(freshProduct.price) + 25, // Apply frontend markup to match logic
            selectedSize: finalSize
        };

        state.cart.push(cartItem);
        saveState();
        updateAllUI();
        if (!silent) showToast(`Added to Cart`);

    } catch (e) {
        console.error(e);
        showToast("Network Error: Could not verify stock");
    }
}

// 2. Updated Async PDP Wrapper
async function addToCartFromPDP() {
    if (!validateSize()) return;

    // Disable button to prevent double click
    const btn = document.getElementById('btn-add-cart');
    const originalText = btn.innerText;
    btn.innerText = "Verifying...";
    btn.disabled = true;

    for (let i = 0; i < state.currentQuantity; i++) {
        await addToCart(state.currentProductId, state.selectedSize, i > 0);
    }

    // Re-enable button
    btn.innerText = originalText;
    btn.disabled = false;

    showToast(`Added ${state.currentQuantity} Item(s) to Cart`);
}

// 3. Updated Async Buy Now (Zaroori hai)
async function buyNow() {
    if (!validateSize()) return;
    if (!state.user) { openAuth('login'); return; }

    const btn = document.getElementById('btn-buy-now');
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    // Wait for items to be added before opening checkout
    for (let i = 0; i < state.currentQuantity; i++) {
        await addToCart(state.currentProductId, state.selectedSize, true);
    }

    btn.innerText = originalText;
    btn.disabled = false;

    openCheckout();
}
function toggleWishlist(id) {
    if (!state.user) { 
        openAuth('login'); 
        return; 
    }
    
    // Convert ID to number to avoid mismatch
    const prodId = Number(id);
    const index = state.wishlist.indexOf(prodId);
    
    if (index === -1) { 
        state.wishlist.push(prodId); 
        showToast("Added to Wishlist"); 
    } else { 
        state.wishlist.splice(index, 1); 
        showToast("Removed from Wishlist"); 
    }
    
    saveState();
    updateAllUI();

    // UI Refresh
    if (document.getElementById('view-listing').style.display !== 'none') renderListingGrid();
    if (document.getElementById('view-wishlist').style.display !== 'none') renderWishlist();
    if (document.getElementById('view-home').style.display !== 'none') renderProducts();

    // PDP Page update
    if (state.currentProductId == prodId) {
        const btn = document.getElementById('pdp-wishlist-btn');
        if (btn) {
            const isNowWish = state.wishlist.includes(prodId);
            btn.innerHTML = `<i data-lucide="heart" class="w-6 h-6 ${isNowWish ? 'fill-red-500 text-red-500' : 'text-gray-400'}"></i>`;
            if (window.lucide) lucide.createIcons();
        }
    }
}
function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const wishProducts = products.filter(p => state.wishlist.includes(p.id));
    if (wishProducts.length === 0) { grid.innerHTML = ''; document.getElementById('wishlist-empty').classList.remove('hidden'); }
    else {
        document.getElementById('wishlist-empty').classList.add('hidden');
        grid.innerHTML = wishProducts.map(p => `
            <div class="bg-white p-4 rounded-xl border border-gray-100 relative group">
                <button onclick="toggleWishlist(${p.id})" class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition z-10"><i data-lucide="x"></i></button>
                <img src="${p.img}" class="w-full h-40 object-cover rounded-lg mb-3 opacity-90 group-hover:opacity-100 transition">
                <h3 class="font-bold text-sm mb-1 text-gray-900">${p.name}</h3>
                <p class="text-gray-500 text-xs mb-3">${formatMoney(p.price)}</p>
                <button onclick="openProductPage(${p.id})" class="w-full py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-bold transition">View Product</button>
            </div>
        `).join('');
        if (window.lucide) lucide.createIcons();
    }
}

function addToCart(id, size = null, silent = false) {
    if (!state.user) { openAuth('login'); return; }
    const finalSize = size || "Standard";
    const product = products.find(p => p.id === id);

    const cartItem = { ...product, selectedSize: finalSize };
    state.cart.push(cartItem);
    saveState();
    updateAllUI();
    if (!silent) showToast(`Added to Cart`);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (state.cart.length === 0) {
        container.innerHTML = '';
        document.getElementById('cart-empty').classList.remove('hidden');
        document.getElementById('cart-summary').classList.add('hidden');
    } else {
        document.getElementById('cart-empty').classList.add('hidden');
        document.getElementById('cart-summary').classList.remove('hidden');
        let subtotal = 0;
        container.innerHTML = state.cart.map((item, idx) => {
            subtotal += item.price;
            return `
                <div class="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl items-center hover:border-purple-200 transition shadow-sm">
                    <img src="${item.img}" class="w-16 h-16 rounded-xl object-cover bg-gray-50">
                    <div class="flex-1">
                        <h4 class="font-bold text-sm text-gray-900">${item.name}</h4>
                        <div class="flex gap-3 text-xs text-gray-500 mt-1">
                            <span class="font-bold text-purple-600">${formatMoney(item.price)}</span>
                            <span class="font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">${item.selectedSize}</span>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${idx})" class="text-gray-400 hover:text-red-500 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `;
        }).join('');
        if (window.lucide) lucide.createIcons();
        document.getElementById('summary-subtotal').innerText = formatMoney(subtotal);
        document.getElementById('summary-total').innerText = formatMoney(subtotal + 5);
        document.getElementById('checkout-subtotal').innerText = formatMoney(subtotal);
        document.getElementById('checkout-final-amount').innerText = formatMoney(subtotal + 5);
    }
}

function removeFromCart(idx) {
    state.cart.splice(idx, 1);
    saveState();
    updateAllUI();
    renderCart();
}

// index.js

async function openCheckout() {
    // 1. User Check
    if (!state.user && state.cart.length > 0) {
        openAuth('login');
        return;
    }

    // 2. Empty Cart Check
    if (state.cart.length === 0) {
        showToast("Cart is empty");
        return;
    }

    showToast("Checking stock..."); // Short English Message

    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error("Server error");
        const allProducts = await res.json();

        const cartCounts = {};
        state.cart.forEach(item => {
            cartCounts[item.id] = (cartCounts[item.id] || 0) + 1;
        });

        let stockIssue = false;

        for (const [id, neededQty] of Object.entries(cartCounts)) {
            const product = allProducts.find(p => p.id == id);

            // MSG 1: Product Removed
            if (!product) {
                showToast(`Item unavailable: ID ${id}`);
                stockIssue = true;
                break;
            }

            // MSG 2: Not Enough Stock
            if (product.stock < neededQty) {
                showToast(`Out of Stock: Only ${product.stock} left of ${product.name}`);
                stockIssue = true;
                break;
            }
        }

        if (stockIssue) return;

        // All Good
        renderCart();
        const modal = document.getElementById('checkout-modal');
        modal.classList.remove('hidden');

        if (state.user) {
            document.getElementById('checkout-email').value = state.user.email || '';
            document.getElementById('checkout-name').value = state.user.name || '';
            if (state.user.address) document.getElementById('checkout-street').value = state.user.address;
            if (state.user.mobile) document.getElementById('checkout-phone').value = state.user.mobile;
            if (state.user.city) document.getElementById('checkout-city').value = state.user.city;
            if (state.user.state) document.getElementById('checkout-state').value = state.user.state;
            if (state.user.pincode) document.getElementById('checkout-pincode').value = state.user.pincode;
        }
        if (window.lucide) lucide.createIcons();

    } catch (e) {
        console.error(e);
        showToast("Connection Failed");
    }
}
function closeCheckout() {
    document.getElementById('checkout-modal').classList.add('hidden');
}
async function processOrder(e) {
    e.preventDefault();

    // --- VALIDATION START ---
    const phoneInput = document.getElementById('checkout-phone').value.trim();
    const pincodeInput = document.getElementById('checkout-pincode').value.trim();
    const emailInput = document.getElementById('checkout-email').value.trim();

    // 1. Mobile Number Validation (Exactly 10 digits, numeric)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneInput)) {
        showToast("Invalid Mobile: Must be 10 digits");
        document.getElementById('checkout-phone').focus();
        document.getElementById('checkout-phone').classList.add('border-red-500');
        return;
    }

    // 2. Pincode Validation (Exactly 6 digits, numeric)
    const pinRegex = /^[0-9]{6}$/;
    if (!pinRegex.test(pincodeInput)) {
        showToast("Invalid Pincode: Must be 6 digits");
        document.getElementById('checkout-pincode').focus();
        document.getElementById('checkout-pincode').classList.add('border-red-500');
        return;
    }

    // 3. Email Match Validation
    // Check if user is logged in first
    if (state.user && state.user.email) {
        if (emailInput.toLowerCase() !== state.user.email.toLowerCase()) {
            showToast("Email must match your login email");
            document.getElementById('checkout-email').focus();
            document.getElementById('checkout-email').classList.add('border-red-500');
            return;
        }
    }
    // --- VALIDATION END ---

    // Calculate Total
    const total = state.cart.reduce((s, i) => s + i.price, 0) + 5;

    // Gather Form Data
    const name = document.getElementById('checkout-name').value;
    const street = document.getElementById('checkout-street').value;
    const city = document.getElementById('checkout-city').value;
    const stateInput = document.getElementById('checkout-state').value;
    const paymentMode = document.querySelector('input[name="payment-mode"]:checked').value;

    const fullAddress = `${street}, ${city}, ${stateInput} - ${pincodeInput}`;

    const orderData = {
        id: 'ORD' + Math.floor(Math.random() * 90000 + 10000),
        email: emailInput,
        customerName: name,
        phone: phoneInput,
        address: fullAddress,
        payment: paymentMode,
        items: [...state.cart],
        total: total,
        status: 'Placed',
        date: new Date().toLocaleDateString('en-IN')
    };

    try {
        const submitBtn = document.querySelector('#checkout-modal button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Processing...";
        submitBtn.disabled = true;

        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();

        submitBtn.innerText = originalText;
        submitBtn.disabled = false;

        if (data.error) {
            showToast("Failed: " + data.error);
            closeCheckout();
            return;
        }

        state.cart = [];
        await saveState();

        updateAllUI();
        closeCheckout();
        showToast("Order Placed Successfully!");

        products = await loadAllProducts();
        fetchUserOrders();
        navigate('orders');

    } catch (err) {
        console.error(err);
        showToast("Server Connection Failed");
    }
}
// Remove red border when user starts typing
['checkout-phone', 'checkout-pincode', 'checkout-email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', () => el.classList.remove('border-red-500'));
    }
});
function renderOrders() {
    const list = document.getElementById('orders-list');

    // Header with Refresh Button
    const headerHtml = `
        <div class="flex justify-between items-center mb-6">
             <h2 class="text-3xl font-black text-purple-950 brand-font uppercase">Order History</h2>
             <button onclick="fetchUserOrders()" class="p-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition" title="Refresh Status">
                <i data-lucide="refresh-cw" class="w-5 h-5"></i>
             </button>
        </div>
    `;

    // Empty State Check
    if (state.orders.length === 0) {
        list.innerHTML = '';
        document.getElementById('orders-empty').classList.remove('hidden');
    } else {
        document.getElementById('orders-empty').classList.add('hidden');

        // Generate HTML
        const ordersHtml = state.orders.map(o => {
            const displayStatus = o.status;
            const secretOtp = o.secretOtp;

            const isCancelled = displayStatus === 'Cancelled';
            // ✅ FIX: 'Return Completed' ko bhi complete maano
            const isReturnComplete = displayStatus === 'Return Closed' || displayStatus === 'Returned' || displayStatus === 'Return Completed';
            const isReturnProcess = (displayStatus === 'Return Requested' || displayStatus === 'Return Approved' || displayStatus === 'Return Assigned' || displayStatus === 'Pickup Assigned' || displayStatus === 'Return Picked Up') && !isReturnComplete;
            const isDelivered = displayStatus === 'Delivered' && !isReturnProcess && !isReturnComplete;

            // --- ✅ OTP LOGIC (UPDATED) ---
            let otpHtml = '';

            // 1. Delivery OTP Condition (Picked Up OR Out for Delivery)
            if ((displayStatus === 'Out for Delivery' || displayStatus === 'Picked Up') && secretOtp) {
                otpHtml = `
                    <div class="mt-4 bg-yellow-50 border-2 border-yellow-400 p-4 rounded-xl flex justify-between items-center mb-2 shadow-sm animate-pulse">
                        <div>
                            <p class="text-xs font-bold text-yellow-800 uppercase tracking-widest flex items-center gap-2">
                                <i data-lucide="shield-check" class="w-4 h-4"></i> Delivery OTP
                            </p>
                            <p class="text-[10px] text-gray-600 font-medium">Share with delivery partner</p>
                        </div>
                        <div class="bg-white px-4 py-2 rounded-lg border border-yellow-200 shadow-inner">
                            <span class="font-black text-2xl text-black tracking-[0.2em]">${secretOtp}</span>
                        </div>
                    </div>`;
            }

            // 2. Return OTP Condition (Approved, Assigned, or Pickup Started)
            else if ((displayStatus === 'Return Approved' || displayStatus === 'Return Assigned' || displayStatus === 'Return Picked Up' || displayStatus === 'Pickup Assigned') && secretOtp) {
                otpHtml = `
                    <div class="mt-4 bg-orange-50 border-2 border-orange-400 p-4 rounded-xl flex justify-between items-center mb-2 shadow-sm animate-pulse">
                        <div>
                            <p class="text-xs font-bold text-orange-800 uppercase tracking-widest flex items-center gap-2">
                                <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Return Pickup OTP
                            </p>
                            <p class="text-[10px] text-gray-600 font-medium">Give this to pickup agent</p>
                        </div>
                        <div class="bg-white px-4 py-2 rounded-lg border border-orange-200 shadow-inner">
                            <span class="font-black text-2xl text-red-600 tracking-[0.2em]">${secretOtp}</span>
                        </div>
                    </div>`;
            }

            // Status Colors
            let statusColor = 'text-blue-600';
            if (isDelivered || isReturnComplete) statusColor = 'text-green-600';
            if (isCancelled) statusColor = 'text-red-500';
            if (isReturnProcess) statusColor = 'text-orange-500';

            // Return Logic
            const canReturn = isReturnWindowOpen(o.date);
            const returnBtnText = canReturn ? "Return Item" : "Return Closed";
            const returnDisabledClass = canReturn ? "text-gray-700 hover:border-purple-600" : "text-gray-300 bg-gray-50 border-transparent cursor-not-allowed";
            const returnAction = canReturn ? `onclick="openReturnModal('${o.id}')"` : "";

            let actionButtons = '';
            if (isCancelled) {
                actionButtons = `<div class="mt-4 pt-3 border-t border-gray-100 text-sm text-red-500 font-bold flex items-center gap-2"><i data-lucide="x-circle" class="w-4 h-4"></i> Cancelled</div>`;
            } else if (isReturnComplete) {
                actionButtons = `<div class="mt-4 pt-3 border-t border-gray-100 text-green-600 font-bold text-sm flex gap-2"><i data-lucide="check-circle-2" class="w-4 h-4"></i> Return Successful</div>`;
            } else if (isReturnProcess) {
                actionButtons = `
                    <div class="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
                        <div class="text-orange-500 text-xs font-bold flex gap-2"><i data-lucide="loader" class="w-3 h-3 animate-spin"></i> ${displayStatus}</div>
                        <button onclick="openTracking('${o.id}')" class="w-full py-2 bg-gray-100 text-gray-700 rounded text-xs font-bold hover:bg-gray-200">Track Return</button>
                    </div>`;
            } else if (isDelivered) {
                actionButtons = `
                    <div class="mt-4 pt-3 border-t border-gray-100 flex gap-3">
                        <button ${returnAction} class="flex-1 py-2 border border-gray-200 ${returnDisabledClass} rounded text-xs font-bold">${returnBtnText}</button>
                        <button onclick="openProductPage('${o.items[0].id}')" class="flex-1 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-bold">Write Review</button>
                    </div>`;
            } else {
                actionButtons = `
                    <div class="mt-4 pt-3 border-t border-gray-100 flex gap-3">
                        <button onclick="openTracking('${o.id}')" class="flex-1 py-2 bg-purple-50 text-purple-700 rounded text-xs font-bold hover:bg-purple-100">Track Order</button>
                        <button onclick="cancelOrder('${o.id}')" class="flex-1 py-2 border border-red-100 text-red-500 rounded text-xs font-bold hover:bg-red-50">Cancel</button>
                    </div>`;
            }

            return `
            <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-lg relative overflow-hidden group hover:shadow-xl transition mb-6">
                <div class="flex justify-between items-start mb-4 border-b border-gray-50 pb-3">
                    <div><p class="font-bold text-sm text-gray-900">#${o.id}</p><p class="text-xs text-gray-500">${o.date}</p></div>
                    <div class="text-right"><span class="font-bold block text-gray-900">${formatMoney(o.total)}</span><span class="text-xs font-bold uppercase ${statusColor}">${displayStatus}</span></div>
                </div>
                ${otpHtml}
                <div class="space-y-3 mb-2">
                    ${o.items.map(i => `<div class="flex items-center gap-3"><img src="${i.img}" class="w-10 h-10 rounded-lg object-cover bg-gray-50"><div><p class="text-sm font-bold text-gray-800">${i.name}</p><p class="text-[10px] text-gray-500">${i.selectedSize}</p></div></div>`).join('')}
                </div>
                ${actionButtons}
            </div>
        `}).join('');

        list.innerHTML = ordersHtml;

        // Re-initialize icons
        if (window.lucide) lucide.createIcons();
    }
}

// --- 16. TRACKING ---

async function openTracking(orderId) {
    document.getElementById('track-order-id').innerText = `#${orderId}`;
    document.getElementById('tracking-modal').classList.remove('hidden');

    // Initial Load
    await fetchUserOrders();
    refreshTracking(orderId);

    // LIVE UPDATE LOOP (Every 3 seconds)
    if (trackingInterval) clearInterval(trackingInterval);
    trackingInterval = setInterval(async () => {
        await fetchUserOrders(); // Fetch fresh data from server
        refreshTracking(orderId); // Update UI
    }, 3000);
}
function refreshTracking(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const status = order.status; // Current Status from DB
    let activeStep = 0;

    // --- STEP LOGIC (Includes Returns) ---

    // Step 1: Confirmed / Driver Assigned
    // (Common for Delivery & Return)
    if (['Confirmed', 'Assigned', 'Picked Up', 'Out for Delivery', 'Delivered',
        'Return Approved', 'Return Assigned', 'Pickup Assigned', 'Return Picked Up', 'Return Completed', 'Returned'].includes(status)) {
        activeStep = 1;
    }

    // Step 2: On The Way (Out for Delivery OR Pickup Assigned)
    if (['Picked Up', 'Out for Delivery', 'Delivered',
        'Pickup Assigned', 'Return Picked Up', 'Return Completed', 'Returned'].includes(status)) {
        activeStep = 2;
    }

    // Step 3: Finished (Delivered OR Return Collected)
    if (['Delivered',
        'Return Completed', 'Returned'].includes(status)) {
        activeStep = 3;
    }

    // Text Logic for Returns vs Delivery
    const isReturn = status.includes('Return') || status.includes('Pickup');

    const steps = [
        {
            title: isReturn ? 'Return Request Approved' : 'Order Placed',
            time: order.date,
            active: true
        },
        {
            title: isReturn ? 'Driver Assigned' : 'Processing',
            time: activeStep >= 1 ? 'Completed' : 'Pending',
            active: activeStep >= 1
        },
        {
            title: isReturn ? 'Agent Out for Pickup' : 'Out for Delivery',
            time: activeStep >= 2 ? (activeStep >= 3 ? 'Completed' : 'Agent is on the way') : 'Pending',
            active: activeStep >= 2
        },
        {
            title: isReturn ? 'Return Collected' : 'Delivered',
            time: activeStep >= 3 ? 'Success' : 'Pending',
            active: activeStep >= 3
        }
    ];

    // HTML Generate
    document.getElementById('tracking-timeline').innerHTML = steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        // Colors
        let dotColor = 'bg-white border-gray-200';
        let lineColor = 'border-gray-200';
        let textColor = 'text-gray-400';

        if (step.active) {
            dotColor = 'bg-purple-600 border-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]';
            lineColor = 'border-purple-600';
            textColor = 'text-purple-900';

            // Pulse animation for the current active step
            if (!steps[index + 1]?.active && activeStep !== 3) {
                dotColor += ' animate-pulse';
            }
        }

        return `
        <div class="relative pl-8 pb-8 border-l-2 ${isLast ? 'border-transparent' : lineColor} transition-colors duration-500">
            <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 ${dotColor} z-10 box-content"></div>
            <h4 class="font-bold text-sm ${textColor}">${step.title}</h4>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">${step.time}</p>
        </div>
    `}).join('');
}
function closeTracking() {
    document.getElementById('tracking-modal').classList.add('hidden');
    if (trackingInterval) clearInterval(trackingInterval);
}
function clearFilters() {
    document.querySelectorAll('.brand-check, .tag-check').forEach(cb => cb.checked = false);
    renderListingGrid();
    showToast("Filters cleared");
}
async function cancelOrder(id) {
    if (!confirm("Cancel this order?")) return;
    try {
        await fetch(`${API_URL}/orders/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        showToast("Order Cancelled");
        fetchUserOrders();
    } catch (e) { showToast("Failed to Cancel"); }
}

// --- 17. RETURNS ---

function openReturnModal(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order && !isReturnWindowOpen(order.date)) {
        showToast("Return Policy: 7 Days Exceeded");
        return;
    }
    document.getElementById('return-order-id').value = orderId;
    document.getElementById('return-order-display-id').innerText = '#' + orderId;
    document.getElementById('return-reason').value = '';
    document.getElementById('return-image').value = '';
    document.getElementById('return-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function closeReturnModal() { document.getElementById('return-modal').classList.add('hidden'); }

async function submitReturnRequest(e) {
    e.preventDefault();
    const orderId = document.getElementById('return-order-id').value;
    const reason = document.getElementById('return-reason').value;
    const imgInput = document.getElementById('return-image');

    const processReturn = async (finalImageString) => {
        try {
            const reqData = {
                reqId: 'RET-' + Math.floor(Math.random() * 10000),
                orderId: orderId,
                reason: reason,
                hasImage: !!finalImageString,
                imageData: finalImageString,
                image: finalImageString,
                status: 'Requested',
                date: new Date().toLocaleDateString('en-IN')
            };

            await fetch(`${API_URL}/returns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqData)
            });

            await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Return Requested' })
            });

            showToast("Return Request Sent!");
            closeReturnModal();
            fetchUserOrders();
        } catch (e) {
            console.error(e);
            showToast("Failed to send request");
        }
    };

    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) {
            processReturn(event.target.result);
        };
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        processReturn(null);
    }
}

// --- 18. GOOGLE LOGIN HELPER ---

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

async function handleGoogleLogin(response) {
    try {
        const token = response.credential;
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const user = await res.json();

        if (user.error) { showToast(user.error); return; }

        state.user = user;
        state.cart = user.cart || [];
        state.wishlist = user.wishlist || [];
        saveState();
        closeAllOverlays();
        updateAllUI();
        showToast("Signed in as " + user.name);
        fetchUserOrders();
    } catch (e) { console.error(e); showToast("Google Login Failed"); }
}

// --- 19. SUNDAY SPECIAL LOGIC ---
// index.js mein initSundayStatus ko isse replace karein

function initSundayStatus() {
    const btn = document.getElementById('sunday-trigger-btn');
    if (!btn) return; // Agar button hi nahi hai to ruk jao

    // Elements ko dhundho (par agar na mile to crash mat hone do)
    const lockedSection = document.getElementById('sunday-locked');
    const liveSection = document.getElementById('sunday-live');
    const track = document.getElementById('sunday-track');

    // Inhe optional handle karenge
    const heroText = document.getElementById('heroText');
    const heroPoster = document.getElementById('heroPoster');
    const heroVideo = document.getElementById('heroVideo');

    if (sundayInterval) clearInterval(sundayInterval);

    function updateTimer() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday

        if (day === 0) {
            // === SUNDAY ACTIVE ===

            // Safe Checks: Sirf tabhi class list change karo agar element exist karta ho
            if (heroText) heroText.classList.add('hidden');
            if (heroVideo) heroVideo.classList.remove('hidden');
            if (heroPoster) {
                heroPoster.src = "sources/sunday.jpg";
                heroPoster.classList.remove('hidden');
            }

            if (lockedSection) lockedSection.classList.add('hidden');
            if (liveSection) liveSection.classList.remove('hidden');

            // Ticker Logic (Same as before)
            if (track && products.length > 0) {
                if (track.children.length === 0 || track.innerHTML.includes('Loading')) {
                    const sundayItems = products.filter(p => p.price == 150 || p.originalPrice == 150);
                    if (sundayItems.length > 0) {
                        const itemsHtml = sundayItems.map(p => `
                            <div onclick="openProductPage(${p.id})" class="flex-shrink-0 w-64 bg-gray-900/80 backdrop-blur-md rounded-2xl p-3 border border-red-500/30 flex items-center gap-4 cursor-pointer hover:bg-gray-800 transition group">
                                <div class="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-700">
                                    <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition">
                                </div>
                                <div class="min-w-0">
                                    <p class="text-white text-sm font-bold truncate w-32">${p.name}</p>
                                    <div class="flex items-center gap-2">
                                        <span class="text-green-400 text-sm font-black">₹150</span>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                        track.innerHTML = itemsHtml.repeat(4);
                        track.className = "flex gap-6 w-max hover:pause-scroll";
                        track.style.animation = "scrollLeft 30s linear infinite";
                    } else {
                        track.innerHTML = `<div class="p-4 text-gray-400">Sold Out</div>`;
                    }
                }
            }

            // Button Update
            if (!btn.classList.contains('sunday-active')) {
                btn.classList.add('sunday-active');
                btn.className = "w-full md:w-auto px-12 py-5 rounded-full font-black uppercase tracking-widest text-lg transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.6)] border-2 border-red-500 bg-black text-white cursor-pointer flex items-center justify-center gap-3 animate-pulse";
                btn.innerHTML = `ENTER FLASH SALE`;
                btn.onclick = openSundayPage;
            }

        } else {
            // === NORMAL DAY (CLOSED) ===

            // Safe Revert
            if (heroText) heroText.classList.remove('hidden');
            if (heroVideo) heroVideo.classList.remove('hidden'); // Video ko chhupana hai to .add('hidden') karein

            if (lockedSection) lockedSection.classList.remove('hidden');
            if (liveSection) liveSection.classList.add('hidden');

            btn.classList.remove('sunday-active');
            btn.onclick = () => showToast("Store opens only on Sunday!");

            // Countdown Calculation
            const target = new Date();
            target.setDate(now.getDate() + (7 - day) % 7);
            target.setHours(0, 0, 0, 0);
            if (target <= now) target.setDate(target.getDate() + 7);

            const diff = target - now;
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            // Button Text Update
            btn.className = "w-full md:w-auto px-8 py-4 rounded-full font-bold text-sm border-2 border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed font-mono shadow-inner";
            btn.innerHTML = `<div class="flex items-center gap-2"><span>OPENS IN: <span class="text-purple-600 font-black text-base">${d}d ${h}h ${m}m ${s}s</span></span></div>`;
        }
    }

    updateTimer();
    sundayInterval = setInterval(updateTimer, 1000);
}
function openSundayPage() {
    switchView('sunday');
    const sundayItems = products.filter(p => p.price === 150 || p.originalPrice === 150);
    const grid = document.getElementById('sunday-grid');

    if (sundayItems.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-20"><h3 class="text-xl font-bold text-gray-400">Sold Out</h3></div>`;
    } else {
        grid.innerHTML = sundayItems.map((p, i) => `
            <div onclick="openProductPage(${p.id})" class="bg-white p-4 rounded-3xl border border-purple-100 group cursor-pointer relative overflow-hidden shadow-lg hover:shadow-purple-200 transition transform hover:-translate-y-2">
                <div class="absolute top-3 left-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase z-10">Only ₹150</div>
                <div class="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden"><img src="${p.img}" class="w-full h-full object-cover"></div>
                <div><h3 class="font-bold text-lg text-gray-900 truncate">${p.name}</h3><span class="font-black text-xl text-gray-900">₹150</span></div>
            </div>
        `).join('');
    }
    window.scrollTo(0, 0);
}

function handleSundayClick() {
    const now = new Date();
    if (now.getDay() === 0) openSundayPage();
    else showToast("Store opens only on Sunday!");
}
// --- ADD THIS AT THE BOTTOM OF index.js ---

function initGrandOpeningSlider() {
    const slides = document.querySelectorAll('.grand-opener-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    setInterval(() => {
        // 1. Current slide ko chhupao (Fade Out + Zoom In slightly)
        slides[currentSlide].classList.remove('opacity-100', 'scale-100');
        slides[currentSlide].classList.add('opacity-0', 'scale-110');

        // 2. Next Slide Calculate karo
        currentSlide = (currentSlide + 1) % slides.length;

        // 3. Next slide ko dikhao (Fade In + Reset Zoom)
        slides[currentSlide].classList.remove('opacity-0', 'scale-110');
        slides[currentSlide].classList.add('opacity-100', 'scale-100');

    }, 3500); // Change image every 3.5 seconds
}

// Ensure this runs when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGrandOpeningSlider();
});
// --- ADD THIS TO index.js ---

function toggleSundayMode(isActive) {
    const exitBtn = document.getElementById('exit-sunday-btn');

    if (isActive) {
        // Sunday View mein jaa rahe hain
        switchView('sunday');
        if (exitBtn) exitBtn.classList.remove('hidden'); // Floating button dikhao
    } else {
        // Wapas Home aa rahe hain
        switchView('home');
        if (exitBtn) exitBtn.classList.add('hidden'); // Button chhupao
    }
}
// A. Get User Accurate Location (Forces GPS)
function getUserLocation() {
    const locText = document.getElementById('user-location-text');

    // Check if Geolocation is supported
    if (!navigator.geolocation) {
        locText.innerText = "GPS Not Supported";
        return;
    }

    locText.innerText = "Waiting for Satellite...";

    // 1. Force High Accuracy (GPS Only)
    const options = {
        enableHighAccuracy: true, // Satellite ko force karega
        timeout: 20000,           // 20 sec wait karega (GPS lock hone mein time lagta hai)
        maximumAge: 0             // Purana saved location bilkul use nahi karega
    };

    const success = async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Debugging: Agar accuracy 5km se zyada kharab hai, to user ko batao
        if (accuracy > 5000) {
            console.warn("Low Accuracy (likely IP based):", accuracy);
            // Hum fir bhi try karenge, par result shayad Pune aaye agar GPS lock nahi hua
        }

        try {
            // Using OpenStreetMap with Village/Street details
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                headers: { 'Accept-Language': 'en-US,en;q=0.9' }
            });

            if (!res.ok) throw new Error("Map Failed");

            const data = await res.json();
            const address = data.address;

            // 2. Specific Address Logic for Villages (Nhavi/Jalgaon)
            // Gaon (Village) > Rasta (Road) > Colony
            const specific = address.village || address.road || address.building || address.hamlet || "";
            const area = address.suburb || address.residential || address.town || "";
            const city = address.city || address.county || address.state_district || "";
            const pincode = address.postcode || "";

            // Format: "Nhavi, Jalgaon - 425001"
            let shortAddr = "";

            if (specific) shortAddr += specific;
            if (area && area !== specific) shortAddr += `, ${area}`;
            if (city && city !== area) shortAddr += `, ${city}`;

            // Clean up commas
            shortAddr = shortAddr.replace(/^, /, '').trim();

            // Fallback
            if (shortAddr.length < 3) shortAddr = city || "Location Found";
            if (shortAddr.length > 35) shortAddr = shortAddr.substring(0, 32) + "...";

            locText.innerText = shortAddr;

            // Save to Profile
            if (state.user) {
                state.user.pincode = pincode;
                state.user.city = city;
                if (!state.user.address) state.user.address = `${specific}, ${area}`;
            }

        } catch (e) {
            // Backup Map Service (BigDataCloud) agar pehla fail ho
            try {
                const res2 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data2 = await res2.json();
                locText.innerText = `${data2.locality || data2.city}, ${data2.principalSubdivision}`;
            } catch (err2) {
                locText.innerText = "Map Error (Try Again)";
            }
        }
    };

    const error = (err) => {
        if (err.code === 1) locText.innerText = "Please Allow GPS Permission";
        else if (err.code === 2) locText.innerText = "GPS Signal Not Found (Go Outside)";
        else if (err.code === 3) locText.innerText = "GPS Timeout (Try Again)";
        else locText.innerText = "Location Error";
    };

    // Request Location
    navigator.geolocation.getCurrentPosition(success, error, options);
}
// B. Track Recently Viewed Items
function addToRecent(product) {
    let recent = JSON.parse(localStorage.getItem('kicks_recent')) || [];

    // Remove if already exists to push to top
    recent = recent.filter(p => p.id !== product.id);

    // Add to beginning
    recent.unshift({
        id: product.id,
        name: product.name,
        img: product.img,
        price: product.price
    });

    // Keep only last 6
    if (recent.length > 6) recent.pop();

    localStorage.setItem('kicks_recent', JSON.stringify(recent));
    renderRecentSection(); // Refresh UI
}

// C. Render "Still Looking For These?"
function renderRecentSection() {
    const section = document.getElementById('recent-view-section');
    const container = document.getElementById('recent-items-container');
    const nameDisplay = document.getElementById('recent-user-name');

    // 1. Get History from LocalStorage
    let recent = JSON.parse(localStorage.getItem('kicks_recent')) || [];

    // --- FIX START: Filter out deleted products ---
    // Check karo ki recent item abhi bhi hamare active 'products' list mein hai ya nahi
    if (products.length > 0) {
        const validRecent = recent.filter(r => products.some(p => p.id === r.id));

        // Agar kuch items delete ho gaye hain, to LocalStorage update kar do
        if (validRecent.length !== recent.length) {
            recent = validRecent;
            localStorage.setItem('kicks_recent', JSON.stringify(recent));
        }
    }
    // --- FIX END ---

    // Personalize Name
    if (state.user && state.user.name) {
        nameDisplay.innerText = state.user.name.split(' ')[0];
    } else {
        nameDisplay.innerText = "Guest";
    }

    if (recent.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = recent.map(item => `
        <div onclick="openProductPage(${item.id})" class="min-w-[120px] bg-white rounded-xl p-2 cursor-pointer shadow-sm hover:scale-105 transition-transform">
            <div class="h-28 w-full bg-gray-50 rounded-lg mb-2 overflow-hidden">
                <img src="${item.img}" class="w-full h-full object-cover">
            </div>
            <p class="text-xs font-bold text-gray-800 truncate">${item.name}</p>
            <p class="text-xs text-[#c20069] font-black mt-1">₹${item.price}</p>
        </div>
    `).join('');
}
// --- D. AUTO RUN ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    getUserLocation(); // Try getting location immediately
    renderRecentSection();
});// --- CATEGORY VIEW LOGIC ---

// 1. Default View (Jab Categories page khule)
function loadDefaultCategoryView() {
    const container = document.getElementById('category-right-content');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center pb-20">
            <div class="bg-purple-50 p-6 rounded-full mb-4">
                <i data-lucide="layout-grid" class="w-12 h-12 text-purple-600"></i>
            </div>
            <h3 class="font-bold text-gray-900 text-lg mb-2">Select a Category</h3>
            <p class="text-gray-500 text-xs max-w-[200px]">Choose a category from the sidebar to explore products.</p>
        </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Reset Sidebar Highlight
    const allItems = document.querySelectorAll('#view-categories .cursor-pointer');
    allItems.forEach(el => {
        el.classList.remove('border-l-4', 'border-blue-600', 'bg-white');
        el.classList.add('border-b', 'border-gray-100');
        const span = el.querySelector('span');
        if (span) span.classList.remove('text-purple-600', 'font-bold');
    });
}

// 2. Load Specific Category Logic
function loadCategoryInView(categoryName) {
    const container = document.getElementById('category-right-content');
    if (!container) return;

    // A. Clear previous slideshow (Fixes glitching)
    if (categorySlideInterval) {
        clearInterval(categorySlideInterval);
        categorySlideInterval = null;
    }

    // B. Loading State
    container.innerHTML = `<div class="flex h-full items-center justify-center"><i data-lucide="loader" class="animate-spin text-purple-600 w-10 h-10"></i></div>`;
    if (window.lucide) lucide.createIcons();

    // C. Get Data
    const defaultImg = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80";
    const catConfig = bannerConfig[categoryName] || {
        title: categoryName,
        desc: "Explore our latest collection",
        images: [defaultImg]
    };

    const catProducts = products.filter(p => p.category === categoryName);

    // D. Build HTML
    let html = ``;

    // --- Banner Section ---
    if (catConfig.images && catConfig.images.length > 0) {
        const slidesHtml = catConfig.images.map((img, i) =>
            `<img src="${img}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === 0 ? 'opacity-100' : 'opacity-0'}" id="cat-banner-${i}">`
        ).join('');

        html += `
        <div class="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-6 shadow-xl group border border-purple-100">
            ${slidesHtml}
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10 z-10">
                <h3 class="text-white font-black text-3xl md:text-5xl uppercase brand-font drop-shadow-lg">${catConfig.title}</h3>
                <p class="text-white/90 text-sm md:text-base font-medium">${catConfig.desc}</p>
            </div>
        </div>`;
    }

    // --- Product Grid Section ---
    if (catProducts.length > 0) {
        html += `<h3 class="font-bold text-gray-800 mb-4 flex justify-between items-center px-2">
                    <span class="text-lg">Shop ${categoryName}</span>
                    <span class="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">${catProducts.length} Items</span>
                 </h3>
                 <div class="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">`;

        html += catProducts.map(p => `
            <div onclick="openProductPage(${p.id})" class="bg-white border border-gray-100 rounded-2xl p-3 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 group">
                <div class="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                    <img src="${p.img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
                    <div class="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-purple-900">₹${p.price}</div>
                </div>
                <h4 class="font-bold text-xs text-gray-900 line-clamp-2 min-h-[2.5em]">${p.name}</h4>
                <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">${p.brand}</p>
            </div>
        `).join('');
        html += `</div>`;
    } else {
        html += `
        <div class="flex flex-col items-center justify-center py-20 text-gray-400">
            <div class="bg-gray-50 p-4 rounded-full mb-3">
                <i data-lucide="package-open" class="w-8 h-8 opacity-50"></i>
            </div>
            <p class="text-sm font-medium">No items found in ${categoryName}</p>
        </div>`;
    }

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    highlightSidebar(categoryName);

    // E. Start Slideshow Animation
    if (catConfig.images && catConfig.images.length > 1) {
        let currentSlide = 0;
        const totalSlides = catConfig.images.length;

        categorySlideInterval = setInterval(() => {
            const currEl = document.getElementById(`cat-banner-${currentSlide}`);
            if (currEl) {
                currEl.classList.remove('opacity-100');
                currEl.classList.add('opacity-0');
            }
            currentSlide = (currentSlide + 1) % totalSlides;
            const nextEl = document.getElementById(`cat-banner-${currentSlide}`);
            if (nextEl) {
                nextEl.classList.remove('opacity-0');
                nextEl.classList.add('opacity-100');
            }
        }, 3000);
    }
}

// Helper: Highlight Sidebar Item
function highlightSidebar(activeName) {
    const allItems = document.querySelectorAll('#view-categories .cursor-pointer');

    // Reset All
    allItems.forEach(el => {
        el.classList.remove('border-l-4', 'border-purple-600', 'bg-white');
        el.classList.add('border-b', 'border-gray-100');

        const span = el.querySelector('span');
        if (span) {
            span.classList.remove('text-purple-600', 'font-bold');
            span.classList.add('text-gray-600');
        }

        const imgDiv = el.querySelector('div');
        if (imgDiv) {
            imgDiv.classList.remove('border-purple-500');
            imgDiv.classList.add('border-gray-200');
        }
    });

    // Highlight Active
    allItems.forEach(el => {
        if (el.innerText.includes(activeName)) {
            el.classList.remove('border-b', 'border-gray-100');
            el.classList.add('border-l-4', 'border-purple-600', 'bg-white');

            const span = el.querySelector('span');
            if (span) {
                span.classList.remove('text-gray-600');
                span.classList.add('text-purple-600', 'font-bold');
            }

            const imgDiv = el.querySelector('div');
            if (imgDiv) {
                imgDiv.classList.remove('border-gray-200');
                imgDiv.classList.add('border-purple-500');
            }
        }
    });
}

// =========================================
// NEW HOME SLIDESHOW LOGIC (Fixed & Clean)
// =========================================
function initHomeSlideshowLogic() {
    const slidesContainer = document.getElementById('home-slides-container');
    const indicatorsContainer = document.getElementById('home-slides-indicators');
    if (!slidesContainer || !indicatorsContainer) return;

    // 1. Clear Old Interval
    if (homeSlideshowInterval) clearInterval(homeSlideshowInterval);

    // 2. Check Day & Prepare Images
    const todayIndex = new Date().getDay();
    const isSunday = todayIndex === 0;
    let imagesToShow = [...homeBannerConfig.regularImages];
    if (isSunday) {
        imagesToShow.unshift(homeBannerConfig.sundaySpecialImage);
    }

    // 3. Generate HTML for Images
    slidesContainer.innerHTML = imagesToShow.map((img, i) => `
        <div class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${i === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}" id="home-slide-${i}">
            <img src="${img}" class="w-full h-full object-cover" alt="Slide ${i + 1}">
        </div>
    `).join('') + '<div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-20 pointer-events-none"></div>';

    // 4. Generate HTML for Indicators (Flat Lines Style)
    indicatorsContainer.innerHTML = imagesToShow.map((_, i) => `
        <button id="indicator-${i}" class="h-1 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-purple-600' : 'w-4 bg-gray-300 hover:bg-purple-300'}"></button>
    `).join('');

    // 5. Start Animation Loop (Images + Indicators)
    if (imagesToShow.length > 1) {
        let current = 0;
        homeSlideshowInterval = setInterval(() => {

            // --- A. Deactivate Current Slide & Dot ---
            const currSlide = document.getElementById(`home-slide-${current}`);
            const currDot = document.getElementById(`indicator-${current}`);

            if (currSlide) {
                currSlide.classList.remove('opacity-100', 'z-10');
                currSlide.classList.add('opacity-0', 'z-0');
            }
            if (currDot) {
                currDot.classList.remove('w-8', 'bg-purple-600');
                currDot.classList.add('w-4', 'bg-gray-300');
            }

            // --- B. Move to Next Index ---
            current = (current + 1) % imagesToShow.length;

            // --- C. Activate Next Slide & Dot ---
            const nextSlide = document.getElementById(`home-slide-${current}`);
            const nextDot = document.getElementById(`indicator-${current}`);

            if (nextSlide) {
                nextSlide.classList.remove('opacity-0', 'z-0');
                nextSlide.classList.add('opacity-100', 'z-10');
            }
            if (nextDot) {
                nextDot.classList.remove('w-4', 'bg-gray-300');
                nextDot.classList.add('w-8', 'bg-purple-600');
            }

        }, 4000); // Change every 4 seconds
    }
}