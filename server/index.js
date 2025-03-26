const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" }); // Ensure this file is at the correct path
const connectDatabase = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const biomassRoutes = require("./routes/biomassRoutes");
const { Server } = require("socket.io");
const http = require("http");
const OptimizationMetric = require("./models/OptimizationMetric");

// ✅ Fix: Use process.env instead of import.meta.env
const FRONTEND_URL = process.env.FRONTEND_URL||"https://bhoomi-mitra.onrender.com";  

const app = express();
connectDatabase();

const corsOptions = {
  origin: FRONTEND_URL, 
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Update metrics every 30 seconds and broadcast
setInterval(async () => {
  try {
    const metrics = await OptimizationMetric.findOne().sort({ updatedAt: -1 });
    if (metrics) {
      io.emit("metrics_update", metrics);
    }
  } catch (error) {
    console.error("Error broadcasting metrics:", error);
  }
}, 30000);

app.get("/", (req, res) => {
  res.send("Welcome to Bhoomi Mitra Backend!");
});

// API Routes
app.use("/api", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/biomass", biomassRoutes);

const PORT = process.env.PORT || 5000;

// ✅ Fix: Use server.listen instead of app.listen
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
