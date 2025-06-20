const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
    const { title, owner_id, content } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO documents (title,content, owner_id) VALUES ($1, $2, $3) RETURNING *",
            [title, Buffer.from(content, "base64"), owner_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            " SELECT * FROM documents WHERE id = $1",
            [id]
        );
        if (!result.rows.length)
            return res.status(404).json({ error: "Document Not Found" });
        //* CONVERT BYTEA to base64 for Frontend
        result.rows[0].content = result.rows[0].content.toString("base64");
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
