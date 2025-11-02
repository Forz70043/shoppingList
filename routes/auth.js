const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('../config/passport');
const verifyToken = require('../middleware/auth');

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
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FE_URL}/login`,
        session: false 
    }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, roles: req.user.roles },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 60 * 60 * 1000,
        });
        res.redirect(process.env.FE_URL);
        //res.json({ token: req.user.token, user: req.user.user });
    }
);

/**
 * User registration
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password, roles } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'Mandatory fileds: username, email, password' });
        }

        const isUser = await User.findOne({ where: { email } });
        if (isUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, username, email, password: hashedPassword });

        // assign roles: accepts single role (string) or array; fallback to 'user'
        const Role = require('../models/Role');
        let rolesToAssign = ['user'];
        if (roles) {
            if (Array.isArray(roles)) rolesToAssign = roles;
            else if (typeof roles === 'string') rolesToAssign = [roles];
        }

        // find existing roles; ignore non-existing roles
        const roleInstances = await Role.findAll({ where: { name: rolesToAssign } });
        if (roleInstances && roleInstances.length) {
            await newUser.addRoles(roleInstances);
        } else {
            // if role not found, assign 'user' if exists
            const defaultRole = await Role.findOne({ where: { name: 'user' } });
            if (defaultRole) await newUser.addRole(defaultRole);
        }
        
        // include assigned roles in response
        const assigned = await newUser.getRoles();

        res.status(201).json({ message: 'User create successfully', user: newUser, roles: assigned.map(r => r.name) });
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
    
        // take user roles
        const userRoles = (await user.getRoles()).map(r => r.name);

        const token = jwt.sign(
            { id: user.id, email: user.email, roles: userRoles },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send cookie in secure HTTP-only
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 60 * 60 * 1000, // 1h
        });
        
        res.status(200).json({ user, token });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error on server', error });
    }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get("/me", verifyToken, (req, res) => {
    res.json({ id: req.user.id, email: req.user.email, roles: req.user.roles });
});

/**
 * User logout
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;