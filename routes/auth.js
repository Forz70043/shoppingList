const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('../config/passport');

/**
 * Google authentication
 * GET /api/auth/google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * Google authentication callback
 * GET /api/auth/google/callback
 */
router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        res.json({ token: req.user.token, user: req.user.user });
    }
);

/**
 * User registration
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'Mandatory fileds: username, email, password' });
        }

        const isUser = await User.findOne({ where: { email } });
        if (isUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, username, email, password: hashedPassword });
        
        res.status(201).json({ message: 'User create successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on registration', error });
    }
});


/**
 * User login
 * POST /api/auth/signin
 */
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
            return res.status(400).json({ message: 'Mandatory fileds: email, password' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Credential not valid' });
        }
    
        const isPasswordCorrect = await bcrypt.compare(password.trim(), user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Email o password wrong' });
        }
    
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.status(200).json({ token });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error on server', error });
    }
});
  
module.exports = router;