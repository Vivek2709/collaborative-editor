const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

//* Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const result = await db.query(
            "INSERT INTO users (name,email,password_hash) VALUES ($1, $2, $3) RETURNING id,name,email",
            [name, email, hashed]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        if (!result.rows.length)
            return res.status(400).json({ error: "Invalid Credentials" });

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(400).json({ error: "Invalid Crentials" });
        const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET);
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
