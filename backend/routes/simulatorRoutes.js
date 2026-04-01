const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");

let simulatorProcess = null;

/* POST /api/simulator/start */
router.post("/start", (req, res) => {
  if (simulatorProcess) {
    return res.json({ status: "already_running", message: "Simulator is already running." });
  }

  const simPath = path.join(__dirname, "../simulator/sensorSimulator.js");
  simulatorProcess = spawn(process.execPath, [simPath], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  simulatorProcess.stdout.on("data", (d) => process.stdout.write("[SIM] " + d));
  simulatorProcess.stderr.on("data", (d) => process.stderr.write("[SIM ERR] " + d));

  simulatorProcess.on("exit", () => {
    simulatorProcess = null;
  });

  res.json({ status: "started", message: "Sensor simulator started." });
});

/* POST /api/simulator/stop */
router.post("/stop", (req, res) => {
  if (!simulatorProcess) {
    return res.json({ status: "not_running", message: "Simulator is not running." });
  }

  simulatorProcess.kill();
  simulatorProcess = null;
  res.json({ status: "stopped", message: "Sensor simulator stopped." });
});

/* GET /api/simulator/status */
router.get("/status", (req, res) => {
  res.json({ running: simulatorProcess !== null });
});

module.exports = router;
