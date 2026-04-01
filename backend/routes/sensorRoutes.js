const express = require("express");
const router = express.Router();

const SensorData = require("../models/sensorData");


// Delete oldest 50 records when total count reaches 100
async function cleanupOldRecords() {
    const count = await SensorData.countDocuments();
    if (count >= 100) {
        const oldest50 = await SensorData
            .find()
            .sort({ timestamp: 1 })
            .limit(50)
            .select("_id");

        const ids = oldest50.map(doc => doc._id);
        await SensorData.deleteMany({ _id: { $in: ids } });
        console.log(`Cleanup: deleted ${ids.length} oldest records (total was ${count})`);
    }
}


// POST sensor data
router.post("/", async (req, res) => {
    try {

        const { machine_id, temperature, vibration, noise, current, gas } = req.body;

        const newData = new SensorData({
            machine_id,
            temperature,
            vibration,
            noise,
            current,
            gas
        });

        await newData.save();

        await cleanupOldRecords();

        res.json({
            message: "Sensor data saved successfully",
            data: newData
        });

    } catch (error) {

        res.status(500).json({ error: error.message });

    }
});


// GET latest sensor data
router.get("/latest", async (req, res) => {
    try {

        const machineId = req.query.machine_id;
        const filter = machineId ? { machine_id: machineId } : {};

        const latest = await SensorData
            .findOne(filter)
            .sort({ timestamp: -1 });

        if (!latest) {
            return res.json({ message: "No sensor data available" });
        }

        res.json(latest);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }
});


// GET last 50 sensor readings
router.get("/history", async (req, res) => {
    try {

        const machineId = req.query.machine_id;
        const filter = machineId ? { machine_id: machineId } : {};

        const data = await SensorData
            .find(filter)
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(data);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }
});

module.exports = router;