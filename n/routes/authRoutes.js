const express = require("express");
const axios = require("axios");
const router = express.Router();

// Google OAuth Config
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5000/auth/google/callback";

// Redirect to Google Auth
router.get("/google", (req, res) => {
    const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email%20profile`;
    res.redirect(authURL);
});

// Google Callback (Exchanges code for tokens)
router.get("/google/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: "Authorization code not provided" });
    }

    try {
        // Exchange code for access token
        const { data } = await axios.post("https://oauth2.googleapis.com/token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
            code
        });

        // Get user info from Google
        const { data: userInfo } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${data.access_token}` }
        });

        // Save user info in session
        req.session.user = userInfo;
        res.redirect("/auth/me"); // Redirect to profile page
    } catch (err) {
        console.error("Error exchanging code for token:", err);
        res.status(500).json({ error: "OAuth authentication failed" });
    }
});

// Check if user is logged in
router.get("/me", (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
    });
});
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");

function hashPassword(password) {
    return crypto.pbkdf2Sync(password, process.env.SALT, 1000, 64, "sha512").toString("hex");
}

router.post(
    "/register",
    [
        body("username").trim().isAlphanumeric().withMessage("Username must be alphanumeric"),
        body("email").isEmail().normalizeEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;
        const hashedPassword = hashPassword(password);

        res.json({
            message: "User registered successfully!",
            username,
            email,
            hashedPassword,
        });
    }
);


module.exports = router;
