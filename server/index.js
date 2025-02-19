const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" })
const connectDatabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require("./routes/weatherRoutes");

const app = express();
connectDatabase();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use("/api/weather", weatherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
