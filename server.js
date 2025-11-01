const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

// Load config
dotenv.config();

// Passport config
require('./config/passport')(passport); // Pass passport object to the config file

const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- Middleware ---
app.use(express.json()); // Body parser
app.use(cors({
    origin: 'http://localhost:3000', // Allow React app to connect
    credentials: true, // Allow cookies/sessions to be sent
}));

// Session Middleware (MUST COME BEFORE Passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't save session if nothing changed
    saveUninitialized: false, // Don't create session until something is stored
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use('/auth', require('./routes/auth')); // OAuth login routes
app.use('/api', require('./routes/api'));   // Search, History, Top Searches

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
