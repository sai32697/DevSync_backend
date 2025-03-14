const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const snippetRoutes = require("./routes/snippetRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

// ✅ CORS Configuration to Allow Frontend Requests
const corsOptions = {
    origin: ["http://localhost:3000",
        "https://devsync-frontend-3ps8.onrender.com"],// Allow frontend (React)
    credentials: true,  // Allow cookies/authentication headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"],  // Allowed headers
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle CORS preflight requests

// ✅ Middleware for JSON parsing
app.use(express.json());

// ✅ Connect to MongoDB
connectDB()
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", protect, taskRoutes);  // 🔒 Protected Task Routes
app.use("/api/snippets", snippetRoutes);  // 🔒 Protected Snippet Routes

// ✅ Default route
app.get("/", (req, res) => {
    res.send("🚀 API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));