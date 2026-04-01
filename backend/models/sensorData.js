const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({

    machine_id: {
        type: String,
        required: true
    },
    temperature: {
        type: Number,
        required: true
    },

    vibration: {
        type: Number,
        required: true
    },

    noise: {
        type: Number,
        required: true
    },

    current: {
        type: Number,
        required: true
    },

    gas: {
        type: Number,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

}, {
    collection: "sensor_data"
});

module.exports = mongoose.model("SensorData", sensorSchema);