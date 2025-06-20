const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({
            connected: true,
            time: result.rows[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ connected: false, error: error.message });
    }
});

module.exports = router;
