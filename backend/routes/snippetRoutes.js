const express = require("express");
const Snippet = require("../models/Snippet");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get All Snippets (Public)
router.get("/", async (req, res) => {
    try {
        const snippets = await Snippet.find({});
        res.status(200).json(snippets);
    } catch (error) {
        console.error("Error fetching snippets:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ✅ Get My Snippets (Only Logged-in Users)
router.get("/my-snippets", protect, async (req, res) => {
    try {
        const snippets = await Snippet.find({ userId: req.user.userId });
        res.status(200).json(snippets);
    } catch (error) {
        console.error("Error fetching my snippets:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Search Snippets by Title, Category, or Language (Public)
router.get("/search", async (req, res) => {
    try {
        const { q } = req.query;
        const snippets = await Snippet.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } },
                { language: { $regex: q, $options: "i" } }
            ]
        });
        res.status(200).json(snippets);
    } catch (error) {
        console.error("Error searching snippets:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get a Single Snippet (Public) and Increment View Count
router.get("/:id", async (req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) return res.status(404).json({ message: "Snippet not found" });

        snippet.views += 1; // ✅ Increment view count
        await snippet.save();

        res.status(200).json(snippet);
    } catch (error) {
        console.error("Error fetching snippet:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Create a Snippet (Only for Logged-in Users)
router.post("/", protect, async (req, res) => {
    try {
        const { title, category, snippet, language } = req.body;
        const newSnippet = new Snippet({
            userId: req.user.userId,
            title,
            category,
            snippet,
            language,
            views: 0,
            downloads: 0,
        });

        await newSnippet.save();
        res.status(201).json(newSnippet);
    } catch (error) {
        console.error("Error creating snippet:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Edit a Snippet (Only Owner Can Edit)
router.put("/:id", protect, async (req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) return res.status(404).json({ message: "Snippet not found" });

        if (snippet.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to edit this snippet" });
        }

        Object.assign(snippet, req.body);
        await snippet.save();
        res.json(snippet);
    } catch (error) {
        console.error("Error updating snippet:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Delete a Snippet (Only Owner Can Delete)
router.delete("/:id", protect, async (req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) return res.status(404).json({ message: "Snippet not found" });

        if (snippet.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to delete this snippet" });
        }

        await snippet.remove();
        res.json({ message: "Snippet deleted" });
    } catch (error) {
        console.error("Error deleting snippet:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Download a Snippet (Public) and Increment Download Count
router.get("/download/:id", async (req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) return res.status(404).json({ message: "Snippet not found" });

        snippet.downloads += 1; // ✅ Increment download count
        await snippet.save();

        res.setHeader("Content-Disposition", `attachment; filename="${snippet.title}.${snippet.language}"`);
        res.setHeader("Content-Type", "text/plain");
        res.send(snippet.snippet);
    } catch (error) {
        console.error("Error downloading snippet:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;