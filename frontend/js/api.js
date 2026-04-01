const API_BASE = "http://localhost:5000/api";

export async function getLatestSensorData(machine) {
  const res = await fetch(`${API_BASE}/sensor/latest?machine_id=${machine}`);
  return await res.json();
}

export async function getSensorHistory(machine) {
  const res = await fetch(`${API_BASE}/sensor/history?machine_id=${machine}`);
  return await res.json();
}

export async function getMachineStatus(machine) {
  const res = await fetch(`${API_BASE}/machine/status?machine_id=${machine}`);
  return await res.json();
}

export async function getSimulatorStatus() {
  const res = await fetch(`${API_BASE}/simulator/status`);
  return await res.json();
}

export async function startSimulator() {
  const res = await fetch(`${API_BASE}/simulator/start`, { method: "POST" });
  return await res.json();
}

export async function stopSimulator() {
  const res = await fetch(`${API_BASE}/simulator/stop`, { method: "POST" });
  return await res.json();
}
