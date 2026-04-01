const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
    res.send("Sensor_Monitoring API Running");
});
// This api endpoint for receiving sensor data from the simulator
const sensorRoutes = require("./routes/sensorRoutes");

app.use("/api/sensor", sensorRoutes);
// This api endpoint for providing machine status to the frontend
const machineRoutes = require("./routes/machineRoutes");

app.use("/api/machine", machineRoutes);

// Simulator control endpoint
const simulatorRoutes = require("./routes/simulatorRoutes");
app.use("/api/simulator", simulatorRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});