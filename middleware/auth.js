const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // Add user to request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token not valid' });
    }
};

module.exports = verifyToken;
