const express = require("express");
const router = express.Router();

const SensorData = require("../models/sensorData");

function calculateStatus(data) {

    if (
        data.temperature > 70 ||
        data.vibration > 70 ||
        data.gas > 40
    ) {
        return "DANGER";
    }

    if (
        data.temperature > 50 ||
        data.vibration > 40 ||
        data.gas > 20
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