const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Get all tasks (Only for logged-in user)
router.get("/", protect, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.userId }).sort({ deadline: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Create new task
router.post("/", protect, async (req, res) => {
    try {
        const { title, description, priority, deadline } = req.body;

        const task = new Task({
            userId: req.user.userId,
            title,
            description,
            priority,
            deadline,
            status: "Not Started",
            completed: false
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: "Invalid task data" });
    }
});

// ✅ Update a task
router.put("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!task) return res.status(404).json({ message: "Task not found" });

        Object.assign(task, req.body);
        task.updatedAt = new Date();
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Delete a task
router.delete("/:id", protect, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!task) return res.status(404).json({ message: "Task not found" });

        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Mark Task as Completed
router.patch("/:id/complete", protect, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.completed = true;
        task.status = "Completed";
        task.updatedAt = new Date();
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;