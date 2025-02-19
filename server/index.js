const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });
const connectDatabase = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const weatherRoutes = require("./routes/weatherRoutes");

const app = express();
connectDatabase();

// ✅ Configure CORS properly
const corsOptions = {
  origin: "http://localhost:5173", // Allow only frontend origin
  credentials: true, // Enable credentials (cookies, authorization headers)
  allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
};
app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/weather", weatherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
