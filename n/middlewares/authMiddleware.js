function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === "admin") {
        next(); // Allow access
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
}

module.exports = { isAdmin };