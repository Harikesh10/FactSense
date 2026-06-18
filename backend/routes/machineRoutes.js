const express = require("express");
const router = express.Router();

const SensorData = require("../models/sensorData");

function calculateStatus(data) {

    if (
        data.temperature > 70 ||
        data.vibration > 65 ||
        data.noise > 65 ||
        data.current > 14 ||
        data.gas > 35 ||
        data.load > 40
    ) {
        return "DANGER";
    }

    if (
        data.temperature > 55 ||
        data.vibration > 45 ||
        data.noise > 50 ||
        data.current > 10 ||
        data.gas > 25 ||
        data.load > 30
    ) {
        return "WARNING";
    }

    return "SAFE";
}

router.get("/status", async (req, res) => {

    try {

        const machineId = req.query.machine_id;

        const latest = await SensorData
            .findOne({ machine_id: machineId })
            .sort({ timestamp: -1 });

        if (!latest) {
            return res.json({ message: "No sensor data available" });
        }

        const status = calculateStatus(latest);

        res.json({
            status: status,
            data: latest
        });

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

});

module.exports = router;