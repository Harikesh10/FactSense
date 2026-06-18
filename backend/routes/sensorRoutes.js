const express = require("express");
const router = express.Router();

const SensorData = require("../models/sensorData");
const sendSMS = require("../utils/twilio");

let lastAlertTime = 0;
const COOLDOWN = 2 * 60 * 1000; // 2 minutes


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

        const { machine_id, temperature, vibration, noise, current, gas, load } = req.body;

        const newData = new SensorData({
            machine_id,
            temperature,
            vibration,
            noise,
            current,
            gas,
            load
        });

        await newData.save();

        await cleanupOldRecords();

        // 🚨 THRESHOLD VALUES (you can tune these)
        const TEMP_THRESHOLD = 70;
        const VIB_THRESHOLD = 65;
        const NOISE_THRESHOLD = 65;
        const CURRENT_THRESHOLD = 14;
        const GAS_THRESHOLD = 35;
        const LOAD_THRESHOLD = 40;

        const now = Date.now();

        // 🚨 ALERT LOGIC WITH COOLDOWN
        if (
            (
                temperature > TEMP_THRESHOLD ||
                vibration > VIB_THRESHOLD ||
                noise > NOISE_THRESHOLD ||
                current > CURRENT_THRESHOLD ||
                gas > GAS_THRESHOLD ||
                load > LOAD_THRESHOLD
            ) &&
            (now - lastAlertTime > COOLDOWN)
        ) {
            await sendSMS(
                `⚠️ ALERT!
Machine: ${machine_id}

Temp: ${temperature}
Vibration: ${vibration}
Noise: ${noise}
Current: ${current}
Gas: ${gas}
Load: ${load}`
            );

            lastAlertTime = now;
        }

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