const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc    Auth with Google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
    (req, res) => {
        // Successful authentication, redirect to frontend dashboard
        res.redirect('http://localhost:3000/');
    }
);

// @desc    Auth with GitHub
// @route   GET /auth/github
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @desc    GitHub auth callback
// @route   GET /auth/github/callback
router.get('/github/callback', 
    passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login' }),
    (req, res) => {
        // Successful authentication, redirect to frontend dashboard
        res.redirect('http://localhost:3000/');
    }
);

// @desc    Logout user
// @route   GET /auth/logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        // Clear the session and redirect
        res.redirect('http://localhost:3000/login');
    });
});

// @desc    Check user status (useful for frontend)
// @route   GET /auth/user
router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        // Send back user data (exclude sensitive session info)
        return res.json({ 
            isAuthenticated: true, 
            user: { 
                id: req.user._id, 
                displayName: req.user.displayName,
                provider: req.user.provider
            } 
        });
    }
    res.json({ isAuthenticated: false });
});

module.exports = router;
