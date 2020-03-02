const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.authenticated = false;
        return next();
    }
    const token = authHeader.split(' ')[1];
    if (!token || token === '') {
        req.authenticated = false;
        return next();
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesecretforlocal');
    } catch (e) {
        req.authenticated = false;
        return next();
    }
    if (!decodedToken) {
        req.authenticated = false;
        return next();
    }
    req.authenticated = true;
    req.userId = decodedToken.userId;
    req.roles = decodedToken.roles;
    next();
};