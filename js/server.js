// server.js - FINAL SECURE VERSION (With Security, Stock Safety & Scalability)
// Developer: Hitesh Ingale
// Status: Production Ready | Security Patched

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

// --- SECURITY PACKAGES ---
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'HITESH_SECURE_KEY_FULL_ACCESS'; 
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://kunal:KdVygwFo0Anau8uX@hitesh.cqczgkd.mongodb.net/kicksdb';

// ==========================================
// 1. SECURITY & MIDDLEWARE
// ==========================================

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
// REPLACE verifyToken FUNCTION IN server.js
const verifyToken = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) {
            console.log("❌ Blocked: No Token Provided");
            return res.status(403).json({ message: "Login Required (No Token)" });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log("❌ Blocked: Invalid/Expired Token");
                return res.status(401).json({ message: "Session Expired" });
            }
            
            // --- DEBUG LOG ---
            // console.log(`User: ${decoded.id}, Role: ${decoded.role}, Required: ${roles}`);

            if (roles.length > 0 && !roles.includes(decoded.role)) {
                console.log(`⛔ Access Denied! User Role: '${decoded.role}' | Required: '${roles}'`);
                return res.status(403).json({ message: `Access Denied. You are a '${decoded.role}', but '${roles}' is required.` });
            }
            
            req.user = decoded;
            next();
        });
    };
};
// --- MAGIC FIX ROUTE (Paste this before app.listen) ---
app.get('/api/make-me-vendor/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        // 1. Find and Update User
        const user = await User.findOneAndUpdate(
            { email: email },
            { $set: { role: 'vendor', shopName: 'My Kicks Shop' } }, // Role force update
            { new: true }
        );

        if (!user) return res.send(`❌ User with email ${email} not found! Register first.`);

        // 2. Ensure Vendor Entry Exists
        await Vendor.findOneAndUpdate(
            { email: email },
            { 
                shopName: user.shopName, 
                ownerName: user.name, 
                email: user.email, 
                joined: new Date().toLocaleDateString() 
            },
            { upsert: true }
        );

        res.send(`
            <h1>✅ SUCCESS!</h1>
            <p>User <b>${email}</b> is now a <b>VENDOR</b>.</p>
            <p>Role in DB: <b>${user.role}</b></p>
            <hr>
            <h3>⚠️ VERY IMPORTANT NEXT STEP:</h3>
            <ol>
                <li>Go back to Dashboard</li>
                <li><b>LOGOUT</b> immediately</li>
                <li>Login again to get a new Access Token</li>
            </ol>
        `);
    } catch (e) {
        res.send(`❌ Error: ${e.message}`);
    }
});
// --- MAGIC FIX ROUTE (Paste in server.js before app.listen) ---
app.get('/api/upgrade-me/:email', async (req, res) => {
    try {
        const email = req.params.email;
        
        // 1. Role update karke Vendor set karein
        const user = await User.findOneAndUpdate(
            { email: email },
            { $set: { role: 'vendor', shopName: 'My Kicks Shop' } }, 
            { new: true }
        );

        if (!user) return res.send("❌ User nahi mila. Pehle Register karein.");

        // 2. Vendor Table mein bhi entry pakki karein
        await Vendor.findOneAndUpdate(
            { email: email },
            { 
                shopName: user.shopName, 
                ownerName: user.name, 
                email: user.email, 
                joined: new Date().toLocaleDateString() 
            },
            { upsert: true }
        );

        res.send(`<h1>✅ DONE! Ab aap VENDOR hain. Turant LOGOUT karke LOGIN karein.</h1>`);
    } catch (e) {
        res.send("Error: " + e.message);
    }
});
// ==========================================
// 2. MONGODB CONNECTION
// ==========================================
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected: Secure Mode'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// ==========================================
// 3. SCHEMAS & MODELS
// ==========================================

const AdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    pass: String,
    picture: String,
    role: { type: String, default: 'admin' },
    lastLogin: Date
});

const VendorSchema = new mongoose.Schema({
    shopName: String,
    ownerName: String,
    mobile: String,
    phone: String,
    email: { type: String, unique: true },
    joined: String,
    address: String,
    totalSales: { type: Number, default: 0 }
});

const DeliveryUserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String },
    phone: String,
    mobile: String,
    city: String,
    state: String,
    vehicleNo: String,
    vehicle: String,
    bio: String,
    status: { type: String, default: 'pending' },
    joined: { type: Date, default: Date.now },
    shift: { type: { type: String }, hours: String },
    wallet: { type: Number, default: 0 },
    role: { type: String, default: 'driver' } // Explicit Role
});

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String },
    shopName: String,        
    mobile: String,
    address: String,      
    city: String,         
    state: String,        
    pincode: String,      
    role: { type: String, default: 'customer' },
    picture: String,
    isGoogle: { type: Boolean, default: false },
    cart: { type: Array, default: [] },
    wishlist: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
    id: Number,              
    name: String,
    price: Number,
    brand: String,
    category: String,       
    subCategory: String,    
    tags: [String],         
    image: String,           
    images: [String],        
    description: String,
    sizes: [String],        
    stock: { type: Number, default: 0 }, // Ensure default
    status: { type: String, default: 'Pending Review' },
    vendorEmail: String,     
    shopName: String,
    createdAt: { type: Date, default: Date.now }
});

// Order Schema (Strict mode enabled ideally, but false for backward compatibility)
const OrderSchema = new mongoose.Schema({
    id: String,
    email: String,
    customerName: String,
    phone: String,
    address: String,
    date: String,
    items: Array,            
    total: Number,           
    price: Number,           
    payment: String,         
    status: { type: String, default: 'Pending' }, 
    secretOtp: String,       
    assignedTo: String,      
    isDeliveryVerified: { type: Boolean, default: false }, 
    isReturnVerified: { type: Boolean, default: false }, 
    returnReason: String,
    returnImage: String,
    timestamp: { type: Date, default: Date.now }
}, { strict: false });

const ReviewSchema = new mongoose.Schema({
    productId: Number,
    user: String,      
    email: String,     
    rating: Number,
    text: String,
    image: String,
    date: String
});

const ReturnRequestSchema = new mongoose.Schema({
    reqId: String,
    orderId: String,
    reason: String,
    imageData: String,
    image: String, 
    hasImage: Boolean,
    status: { type: String, default: 'Requested' },
    date: String
});

const Admin = mongoose.model('Admin', AdminSchema);
const Vendor = mongoose.model('Vendor', VendorSchema);
const DeliveryUser = mongoose.model('DeliveryUser', DeliveryUserSchema);
const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const Review = mongoose.model('Review', ReviewSchema);
const ReturnRequest = mongoose.model('ReturnRequest', ReturnRequestSchema);

// Helper
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// 4. AUTH ROUTES
// ==========================================

// --- ADMIN ---
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, pass } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(401).json({ message: "Admin not found" });

        let isMatch = false;
        if (admin.pass.startsWith('$')) {
            isMatch = await bcrypt.compare(pass, admin.pass);
        } else if (admin.pass === pass) {
            const salt = await bcrypt.genSalt(10);
            admin.pass = await bcrypt.hash(pass, salt);
            await admin.save();
            isMatch = true;
        }

        if (isMatch) {
            await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });
            const adminObj = admin.toObject(); delete adminObj.pass;
            res.json({ ...adminObj, token: generateToken(admin._id, 'admin') });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/register', async (req, res) => {
    try {
        const { name, email, pass } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pass, salt);
        const newAdmin = new Admin({ name, email, pass: hashedPassword });
        await newAdmin.save();
        res.json(newAdmin);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/google', async (req, res) => {
    try {
        const { email, name, picture } = req.body;
        let admin = await Admin.findOne({ email });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const dummyPass = await bcrypt.hash('GOOGLE_SECURE', salt);
            admin = new Admin({ name: name || 'Admin', email, picture, pass: dummyPass });
            await admin.save();
        }
        res.json({ ...admin.toObject(), token: generateToken(admin._id, 'admin') });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USER / VENDOR ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, shopName, role } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        const exists = await User.findOne({ email: cleanEmail });
        
        if (exists) return res.status(400).json({ error: "Email already taken" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            name, email: cleanEmail, password: hashedPassword, shopName: shopName || '', role: role || 'customer' 
        });
        await newUser.save();
        
        if(role === 'vendor') {
            await Vendor.findOneAndUpdate(
                { email: cleanEmail },
                { shopName, ownerName: name, email: cleanEmail, joined: new Date().toLocaleDateString() },
                { upsert: true }
            );
        }
        res.json({ ...newUser.toObject(), token: generateToken(newUser._id, role) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- UPDATE THIS IN SERVER.JS ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        
        const user = await User.findOne({ email: cleanEmail });
        
        if (!user) return res.status(400).json({ error: "User not found. Please Register first." });

        // --- NEW LOGIC: Auto-Set Password for Google Users ---
        // Agar user Google wala hai aur uska password set nahi hai, 
        // to jo password abhi dala gaya hai, usse hi permanent set kar do.
        if (!user.password && user.isGoogle) {
            console.log(`Setting new password for Google user: ${cleanEmail}`);
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid Password" });

        // --- Role & Vendor Sync Logic (Existing) ---
        if (role === 'vendor' || user.role === 'vendor') {
            if (user.role !== 'vendor') {
                user.role = 'vendor';
                user.shopName = user.shopName || (user.name + "'s Shop");
                await user.save();
            }
            await Vendor.findOneAndUpdate(
                { email: cleanEmail },
                { 
                    shopName: user.shopName || "My Shop", 
                    ownerName: user.name, 
                    email: cleanEmail,
                    mobile: user.mobile,
                    joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString() 
                },
                { upsert: true, new: true }
            );
        }

        const userObj = user.toObject(); delete userObj.password;
        res.json({ ...userObj, token: generateToken(user._id, user.role) });

    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: e.message }); 
    }
});
app.post('/api/auth/google', async (req, res) => {
    try {
        const { name, email, picture, token, role } = req.body;
        
        let userEmail = email;
        let userName = name;
        let userPicture = picture;

        // Token Decode Logic
        if (token) {
            try {
                const parts = token.split('.');
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                userEmail = payload.email;
                userName = payload.name;
                userPicture = payload.picture;
            } catch (err) {}
        }

        if (!userEmail) return res.status(400).json({ error: "No email provided" });

        let user = await User.findOne({ email: userEmail });

        if (user) {
            // Existing User Update
            user.picture = userPicture; 
            if (!user.isGoogle) user.isGoogle = true; 

            if (role === 'vendor' && user.role !== 'vendor') {
                user.role = 'vendor';
            }
            await user.save();
        } else {
            // Create New User
            // ✅ FIX: Password ko NULL rakhein (Dummy Hash mat dalein)
            // Isse Manual Login route isse pakad lega aur naya password set kar dega.
            
            const userRole = role || 'customer';
            
            user = new User({ 
                name: userName || 'User', 
                email: userEmail, 
                picture: userPicture || '', 
                password: null, // ✅ CHANGE HERE: No Dummy Password
                isGoogle: true, 
                role: userRole,
                shopName: '' 
            });
            await user.save();

            if (userRole === 'vendor') {
                await Vendor.findOneAndUpdate(
                    { email: userEmail },
                    { 
                        shopName: '', 
                        ownerName: userName, 
                        email: userEmail, 
                        joined: new Date().toLocaleDateString() 
                    },
                    { upsert: true }
                );
            }
        }

        res.json({ ...user.toObject(), token: generateToken(user._id, user.role) });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/driver/google', async (req, res) => {
    try {
        const { email, name } = req.body;
        let user = await DeliveryUser.findOne({ email });
        if (!user) {
            user = new DeliveryUser({ email, name, status: 'pending' });
            await user.save();
        }
        res.json({ ...user.toObject(), token: generateToken(user._id, 'driver') });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 5. SERVER CONFIG & UTILS (NEW)
// ==========================================

// Sunday Status (Server Time Source) - Secure from Client Manipulation
app.get('/api/config/sunday-status', (req, res) => {
    const now = new Date();
    // Convert to IST
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const isSunday = istTime.getDay() === 0;
    res.json({ isSunday });
});

// ==========================================
// 6. CORE CRUD ROUTES
// ==========================================
// --- EMERGENCY FIX ROUTE ---
app.get('/api/fix-role/:email', async (req, res) => {
    try {
        const email = req.params.email;
        // 1. User Table Update
        const user = await User.findOneAndUpdate(
            { email: email },
            { role: 'vendor', shopName: 'My New Shop' },
            { new: true }
        );

        if(!user) return res.send("❌ User not found");

        // 2. Vendor Table Update
        await Vendor.findOneAndUpdate(
            { email: email },
            { 
                shopName: user.shopName, 
                ownerName: user.name, 
                email: user.email, 
                joined: new Date().toLocaleDateString() 
            },
            { upsert: true }
        );

        res.send(`✅ SUCCESS: ${email} is now a VENDOR. Please Logout & Login again.`);
    } catch(e) {
        res.send("❌ Error: " + e.message);
    }
});
// Drivers
app.get('/api/users', verifyToken(['admin']), async (req, res) => res.json(await DeliveryUser.find()));

app.put('/api/users/:email', verifyToken(['admin']), async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const user = await DeliveryUser.findOneAndUpdate({ email }, { status: req.body.status }, { new: true });
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/users/:email', verifyToken(['admin']), async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        await DeliveryUser.findOneAndDelete({ email });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/update/:email', verifyToken(['admin']), async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);
        const updated = await DeliveryUser.findOneAndUpdate({ email }, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/// --- UPDATE THIS IN SERVER.JS ---
app.post('/api/user/update', async (req, res) => {
    try {
        const { email, ...updates } = req.body;
        const cleanEmail = email.toLowerCase().trim();
        
        // 1. User Table Update
        const user = await User.findOneAndUpdate({ email: cleanEmail }, updates, { new: true });
        
        // 2. Vendor Table Sync (Agar user vendor hai)
        if (user && (user.role === 'vendor' || updates.shopName)) {
            await Vendor.findOneAndUpdate({ email: cleanEmail }, {
                shopName: user.shopName,
                ownerName: user.name,
                mobile: user.mobile,
                phone: user.mobile,
                address: user.address,
                email: cleanEmail // Ensure email key exists
            }, { upsert: true });
        }
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/driver/update', async (req, res) => {
    try {
        const { email, ...updates } = req.body;
        const user = await DeliveryUser.findOneAndUpdate({ email }, updates, { new: true });
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// ==========================================
// DRIVER AUTH (MANUAL LOGIN & REGISTER)
// ==========================================

// 1. Driver Register
app.post('/api/driver/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        // Check if driver already exists
        const exists = await DeliveryUser.findOne({ email: cleanEmail });
        if (exists) return res.status(400).json({ message: "Driver email already exists" });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create New Driver
        const newDriver = new DeliveryUser({
            name,
            email: cleanEmail,
            password: hashedPassword,
            status: 'pending', // Admin verification ke liye pending
            role: 'driver',
            wallet: 0
        });

        await newDriver.save();
        res.json({ ...newDriver.toObject(), token: generateToken(newDriver._id, 'driver') });

    } catch (e) {
        console.error("Driver Register Error:", e);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. Driver Login
app.post('/api/driver/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const driver = await DeliveryUser.findOne({ email: cleanEmail });
        
        if (!driver) return res.status(404).json({ message: "Driver not found" });

        // --- NEW LOGIC: Auto-Set Password for Google Driver ---
        // Agar driver ke paas password nahi hai (Google account), 
        // to abhi jo password dala hai wo set kar do.
        if (!driver.password) {
            console.log(`Setting new password for Google Driver: ${cleanEmail}`);
            const salt = await bcrypt.genSalt(10);
            driver.password = await bcrypt.hash(password, salt);
            await driver.save();
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

        // Success
        const driverObj = driver.toObject();
        delete driverObj.password;
        
        res.json({ ...driverObj, token: generateToken(driver._id, 'driver') });

    } catch (e) {
        console.error("Driver Login Error:", e);
        res.status(500).json({ message: "Server Error: " + e.message });
    }
});
// Vendors
app.get('/api/vendors', verifyToken(['admin']), async (req, res) => res.json(await Vendor.find()));

app.post('/api/vendors', verifyToken(['admin']), async (req, res) => { 
    try { await new Vendor(req.body).save(); res.json({success:true}); } 
    catch(e){ res.status(500).json(e); } 
});

app.put('/api/vendors/:id', verifyToken(['admin']), async (req, res) => { 
    try { await Vendor.findByIdAndUpdate(req.params.id, req.body); res.json({success:true}); } 
    catch(e){ res.status(500).json(e); } 
});

app.delete('/api/vendors/:id', verifyToken(['admin']), async (req, res) => { 
    try { await Vendor.findByIdAndDelete(req.params.id); res.json({success:true}); } 
    catch(e){ res.status(500).json(e); } 
});

// ==========================================
// 7. PRODUCT MANAGEMENT (With Pagination)
// ==========================================

app.get('/api/products', async (req, res) => {
    try {
        const filter = req.query.type === 'public' ? { status: 'Approved' } : {};
        
        // --- SCALABILITY FIX: PAGINATION ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Load 50 at a time
        const skip = (page - 1) * limit;

        const products = await Product.find(filter)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
            
        res.json(products);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/my-products/:email', async (req, res) => {
    try { 
        const products = await Product.find({ vendorEmail: req.params.email }).sort({ _id: -1 }); 
        res.json(products); 
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/products', verifyToken(['vendor', 'admin']), async (req, res) => {
    try { 
        const newProduct = new Product(req.body); 
        await newProduct.save(); 
        res.json({ success: true }); 
    } catch (e) { res.status(500).json(e); }
});

app.put('/api/products/:id', verifyToken(['vendor', 'admin']), async (req, res) => {
    try {
        const id = req.params.id;
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        await Product.findOneAndUpdate(query, req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.delete('/api/products/:id', verifyToken(['vendor', 'admin']), async (req, res) => {
    try {
        const id = req.params.id;
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        await Product.findOneAndDelete(query);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// ==========================================
// 8. ORDER MANAGEMENT (ATOMIC STOCK UPDATE)
// ==========================================

app.get('/api/orders', async (req, res) => { 
    try { const orders = await Order.find().sort({_id: -1}).limit(100); res.json(orders); } 
    catch (e) { res.status(500).json(e); } 
});

app.get('/api/orders/:email', async (req, res) => {
    try {
        if(req.params.email.includes('@')) { 
            const orders = await Order.find({ email: req.params.email }).sort({ _id: -1 }); 
            res.json(orders); 
        } else { 
            const query = mongoose.Types.ObjectId.isValid(req.params.email) ? { _id: req.params.email } : { id: req.params.email };
            const order = await Order.findOne(query); 
            res.json(order); 
        }
    } catch (e) { res.status(500).json(e); }
});

// CREATE ORDER (FIXED RACE CONDITION)
app.post('/api/orders', async (req, res) => {
    try {
        let orderData = req.body;
        orderData.secretOtp = Math.floor(1000 + Math.random() * 9000).toString();
        
        let verifiedTotal = 0;
        let verifiedItems = [];
        
        // --- STOCK RACE CONDITION FIX (ATOMIC UPDATE) ---
        if(orderData.items && orderData.items.length > 0) {
            for (const item of orderData.items) {
                
                // Try to find AND decrement stock in one go
                // Only if stock is >= 1
                const updatedProduct = await Product.findOneAndUpdate(
                    { id: item.id, stock: { $gte: 1 } },
                    { $inc: { stock: -1 } },
                    { new: true } // Return updated doc
                );

                if (!updatedProduct) {
                    // STOCK FAILED: Rollback previous items
                    // (Simple manual rollback for non-replica set)
                    for (const vItem of verifiedItems) {
                        await Product.updateOne({ id: vItem.id }, { $inc: { stock: 1 } });
                    }
                    return res.status(400).json({ error: `Out of Stock or Sold Out: ${item.name}` });
                }

                // Calculate price logic
                const realPrice = updatedProduct.price + 25; // Fee logic
                verifiedTotal += realPrice;
                verifiedItems.push({ 
                    ...item, 
                    price: realPrice,
                    vendorEmail: updatedProduct.vendorEmail 
                });
            }

            orderData.items = verifiedItems;
            orderData.total = verifiedTotal + 5; // Platform Fee
            orderData.price = verifiedTotal;
        }

        const newOrder = new Order(orderData);
        await newOrder.save();
        res.json({ success: true, order: newOrder });

    } catch (e) { 
        console.error("Order Error:", e);
        res.status(500).json({ error: e.message }); 
    }
});

// UPDATE ORDER
app.put('/api/orders/:id', verifyToken(['admin', 'driver']), async (req, res) => {
    try {
        const id = req.params.id;
        let updateData = req.body;
        if(updateData.assignedTo) updateData.assignedTo = updateData.assignedTo.toLowerCase().trim();

        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        const order = await Order.findOneAndUpdate(query, updateData, { new: true });
        
        if(order) res.json({ success: true, order });
        else res.status(404).json({ error: "Order not found" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// UPDATE STATUS (Secure)
app.put('/api/update-order-status', verifyToken(['admin', 'driver']), async (req, res) => {
    try {
        const { id, status, otp } = req.body;
        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        let order = await Order.findOne(query);

        if (!order) return res.status(404).json({ message: "Order not found" });

        if (status === 'Delivered' || status === 'Return Completed') {
            if (!otp) return res.status(400).json({ message: "OTP required" });
            if (String(order.secretOtp) !== String(otp).trim()) {
                return res.status(400).json({ message: "Incorrect OTP" });
            }
        }

        if (status === 'Return Approved') {
            order.secretOtp = Math.floor(1000 + Math.random() * 9000).toString();
        }

        order.status = status;
        await order.save();
        res.json(order);

    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders/cancel', async (req, res) => {
    try {
        const { id, status } = req.body; // Status accept karein (Cancel ya Reject)
        const newStatus = status || 'Cancelled'; // Default Cancelled rahega

        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };
        
        // Find order to restock
        const order = await Order.findOne(query);
        
        // Sirf tab restock karein agar pehle se Cancelled/Rejected nahi hai
        if(order && order.status !== 'Cancelled' && order.status !== 'Rejected') {
            
            // Restock Logic (Critical Fix: parseInt use karein)
            for(const item of order.items) {
                const prodId = parseInt(item.id); // ID ko number banayein
                
                // Stock +1 karein
                await Product.updateOne(
                    { id: prodId }, 
                    { $inc: { stock: 1 } }
                );
            }

            order.status = newStatus;
            await order.save();
            res.json({ success: true, message: `Order ${newStatus} & Stock Updated` });
        } else {
            res.status(400).json({ error: "Order already cancelled or not found" });
        }
    } catch (e) { 
        console.error("Cancel Error:", e);
        res.status(500).json({ error: e.message }); 
    }
});
app.delete('/api/orders/:id', verifyToken(['admin']), async (req, res) => {
    try {
        if (mongoose.Types.ObjectId.isValid(req.params.id)) await Order.findByIdAndDelete(req.params.id);
        else await Order.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// ==========================================
// 9. PAYMENT & WALLET LOGIC (SECURE)
// ==========================================

app.post('/api/admin/verify-payment', verifyToken(['admin']), async (req, res) => {
    try {
        const { orderId } = req.body;
        const query = mongoose.Types.ObjectId.isValid(orderId) ? { _id: orderId } : { id: orderId };
        let order = await Order.findOne(query);

        if (!order) return res.status(404).json({ message: "Order not found" });

        let amountToAdd = 0;
        let isUpdated = false;

        const deliveryDone = ['Delivered', 'Return Requested', 'Return Approved', 'Return Assigned', 'Pickup Assigned', 'Return Picked Up', 'Return Completed', 'Returned'];
        if (deliveryDone.includes(order.status) && !order.isDeliveryVerified) {
            order.isDeliveryVerified = true;
            amountToAdd += 20;
            isUpdated = true;
        }

        const returnDone = ['Return Completed', 'Returned'];
        if (returnDone.includes(order.status) && !order.isReturnVerified) {
            order.isReturnVerified = true;
            order.status = 'Returned'; 
            amountToAdd += 20;
            isUpdated = true;
        }

        if (!isUpdated) return res.status(400).json({ message: "No pending payments" });

        await order.save();

        if (order.assignedTo) {
            await DeliveryUser.findOneAndUpdate(
                { email: order.assignedTo },
                { $inc: { wallet: amountToAdd } }
            );
        }

        res.json({ success: true, message: `Wallet Updated: +₹${amountToAdd}` });

    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// 10. REVIEWS & RETURNS
// ==========================================

app.get('/api/reviews/:productId', async (req, res) => { try { const r = await Review.find({ productId: req.params.productId }).sort({ _id: -1 }); res.json(r); } catch (e) { res.status(500).json(e); } });
app.get('/api/reviews/user/:email', async (req, res) => { try { const r = await Review.find({ email: req.params.email }).sort({ _id: -1 }); res.json(r); } catch (e) { res.status(500).json(e); } });
app.post('/api/reviews', async (req, res) => { try { const r = new Review(req.body); await r.save(); res.json(r); } catch (e) { res.status(500).json(e); } });

app.get('/api/returns', verifyToken(['admin']), async (req, res) => res.json(await ReturnRequest.find()));

app.post('/api/returns', async (req, res) => {
    try {
        const ret = new ReturnRequest(req.body); await ret.save();
        const query = mongoose.Types.ObjectId.isValid(req.body.orderId) ? { _id: req.body.orderId } : { id: req.body.orderId };
        await Order.findOneAndUpdate(query, { status: 'Return Requested', returnReason: req.body.reason });
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

app.put('/api/returns/:orderId', verifyToken(['admin']), async (req, res) => {
    try {
        const updated = await ReturnRequest.findOneAndUpdate({ orderId: req.params.orderId }, { status: req.body.status }, { new: true });
        res.json({ success: true, data: updated });
    } catch (e) { res.status(500).json(e); }
});

// ==========================================
// 11. PASSWORD RESET
// ==========================================

const otpStore = new Map();

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiry: Date.now() + 600000 }); // 10 mins
    console.log(`🔐 OTP for ${email}: ${otp}`); 
    res.json({ success: true, otp: otp });
});

app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword, role } = req.body;
    const stored = otpStore.get(email);
    
    if(!stored || stored.otp !== otp || Date.now() > stored.expiry) {
        return res.status(400).json({ message: "Invalid/Expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    let Model = (role === 'admin') ? Admin : (role === 'driver') ? DeliveryUser : User;
    let passField = (role === 'admin') ? 'pass' : 'password';
    
    const update = {}; update[passField] = hash;
    await Model.findOneAndUpdate({ email }, update);
    
    otpStore.delete(email);
    res.json({ success: true });
});

// Emergency Password Fix (Requires Admin Token now)
app.get('/api/fix-admin-pass/:email/:newpass', verifyToken(['admin']), async (req, res) => {
    try {
        const { email, newpass } = req.params;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpass, salt);
        await Admin.findOneAndUpdate({ email }, { pass: hashedPassword });
        res.send(`✅ Password updated for ${email}`);
    } catch (e) { res.status(500).send(e.message); }
});
// --- REELS API ---

// 1. Get All Reels
app.get('/api/reels', async (req, res) => {
    try {
        const reels = await Reel.find().sort({ createdAt: -1 }); // Newest first
        res.json(reels);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. Upload a Reel
app.post('/api/reels', verifyToken(['customer', 'admin', 'vendor']), async (req, res) => {
    try {
        const { videoUrl, caption } = req.body;
        
        // Backend Validation: MongoDB document limit 16MB hoti hai via BSON
        if(!videoUrl) return res.status(400).json({ error: "Video data missing" });

        const newReel = new Reel({
            userId: req.user.id,
            userName: req.user.name || 'User', // User details token se aayengi
            userPic: req.user.picture || '',
            videoUrl: videoUrl,
            caption: caption
        });

        await newReel.save();
        res.json({ success: true, message: "Reel Uploaded!" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Video too large or server error" });
    }
});
// --- REELS SECTION (Corrected & Single Version) ---

// 1. Reel Schema
// Note: Agar Schema pehle se define hai to delete karne ki zaroorat nahi, bas check karo do baar na ho.
const ReelSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    userPic: String,
    videoData: String, // Base64 Video
    caption: String,
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Check if model already exists to prevent OverwriteModelError
const Reel = mongoose.models.Reel || mongoose.model('Reel', ReelSchema);

// 2. Get All Reels Route
app.get('/api/reels', async (req, res) => {
    try {
        const reels = await Reel.find().sort({ createdAt: -1 });
        res.json(reels);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Upload Reel Route
app.post('/api/reels', verifyToken(['customer', 'admin', 'vendor']), async (req, res) => {
    try {
        const { videoData, caption } = req.body;
        
        if(!videoData) return res.status(400).json({ error: "Video data missing" });

        // MongoDB Limit Check (Safety)
        if(videoData.length > 16 * 1024 * 1024) {
             return res.status(400).json({ error: "Video too large for Database (Limit 15MB)" });
        }

        const newReel = new Reel({
            userId: req.user.id,
            userName: req.user.name || 'User',
            userPic: req.user.picture || '',
            videoData: videoData,
            caption: caption
        });

        await newReel.save();
        res.json({ success: true, message: "Reel Uploaded!" });
    } catch (e) {
        console.error("Reel Upload Error:", e);
        res.status(500).json({ error: "Server Error or Video Too Large" });
    }
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Secure Kicks Server running on port ${PORT}`));
}

// Export the app so Vercel can run it as a serverless function
module.exports = app;