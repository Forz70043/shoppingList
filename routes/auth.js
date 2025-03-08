const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

/**
 * User registration
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const isUser = await User.findOne({ where: { email } });
        if (isUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await User.create({ name, username, email, password });
        res.status(201).json({ message: 'User create successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error on registration' });
    }
});


/**
 * User login
 * POST /api/auth/signin
 */
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
    
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Email or password wrong' });
        }
    
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Email o password wrong' });
        }
    
        // Crea un token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Restituisci il token
        res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error on login' });
    }
});
  
module.exports = router;