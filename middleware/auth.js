const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // Add user to request
        next();
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Token verification error:', error);}
        res.status(401).json({ message: 'Token not valid' });
    }
};

module.exports = verifyToken;
