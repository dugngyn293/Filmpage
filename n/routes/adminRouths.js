const express = require("express");
const { isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/dashboard", isAdmin, (req, res) => {
    res.json({ message: "Welcome to the admin dashboard!" });
});

module.exports = router;
