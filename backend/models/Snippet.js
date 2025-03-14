const mongoose = require("mongoose");

const SnippetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who created it
    title: { type: String, required: true },
    snippet: { type: String, required: true },
    category: { type: String, required: true },
    language: { type: String, required: true },
    views: { type: Number, default: 0 }, // Count views
    downloads: { type: Number, default: 0 }, // Count downloads
}, { timestamps: true });

module.exports = mongoose.model("Snippet", SnippetSchema);