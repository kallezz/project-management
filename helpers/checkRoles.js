const checkRoles = (req, res, role) => {
    if (!req.authenticated || !req.roles.includes(role)) {
        res.status(401).json({
            message: 'Unauthorized.'
        });
        return;
    }
};

module.exports = checkRoles;