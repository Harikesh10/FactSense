const axios = require("axios");

const API_URL = "http://localhost:5000/api/sensor";

let mode = "normal";
const machines = ["MACHINE_1", "MACHINE_2", "MACHINE_3"];

function getRandomMachine() {
    return machines[Math.floor(Math.random() * machines.length)];
}
function round2(n) {
    return Math.round(n * 100) / 100;
}

function generateSensorData() {

    if (mode === "normal") {

        return {
            machine_id: getRandomMachine(),
            temperature: round2(35 + Math.random() * 10),
            vibration: round2(20 + Math.random() * 10),
            noise: round2(30 + Math.random() * 10),
            current: round2(5 + Math.random() * 3),
            gas: round2(5 + Math.random() * 5)
        };

    }

    if (mode === "warning") {

        return {
            machine_id: getRandomMachine(),
            temperature: round2(55 + Math.random() * 10),
            vibration: round2(45 + Math.random() * 10),
            noise: round2(50 + Math.random() * 10),
            current: round2(8 + Math.random() * 4),
            gas: round2(20 + Math.random() * 10)
        };

    }

    if (mode === "danger") {

        return {
            machine_id: getRandomMachine(),
            temperature: 75 + round2(Math.random() * 10),
            vibration: 75 + round2(Math.random() * 10),
            noise: 70 + round2(Math.random() * 10),
            current: 12 + round2(Math.random() * 5),
            gas: 40 + round2(Math.random() * 20)
        };

    }

}

async function sendSensorData() {

    try {

        const data = generateSensorData();

        await axios.post(API_URL, data);

        console.log("Mode:", mode, "| Data:", data);

    } catch (error) {

        console.error("Error:", error.message);

    }

}

setInterval(sendSensorData, 5000);


// change machine state every 30 seconds
setInterval(() => {

    const states = ["normal", "warning", "danger"];

    mode = states[Math.floor(Math.random() * states.length)];

    console.log("Machine state changed to:", mode);

}, 30000);