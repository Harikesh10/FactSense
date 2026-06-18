import { loadDashboard } from './dashboard.js';
import { createSparkline, createDonut, createDangerChart, updateSparkline, updateDonut, updateDangerChart } from './charts.js';
import { getSimulatorStatus, startSimulator, stopSimulator, getSensorHistory } from './api.js';

let machine = 'MACHINE_1';
let sensorHistory = [];
let historyLabels = [];

/* Sensor power state - exposed for dashboard.js */
const sensorPower = {
  temp: true,
  vib: true,
  noise: true,
  gas: true,
  current: true,
  load: true,
};
window.__sensorPower = sensorPower;

/* -- CLOCK -- */
function tickClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
}
setInterval(tickClock, 1000);
tickClock();

/* -- MACHINE SELECTOR -- */
document.getElementById('machineSelector').addEventListener('change', (e) => {
  machine = e.target.value;
  sensorHistory = [];
  historyLabels = [];
  loadDashboard(machine);
});

/* -- POLLING -- */
async function poll() {
  await loadDashboard(machine);
}
poll();
setInterval(poll, 5000);

/* -- HISTORY POLLING for charts -- */
async function pollHistory() {
  try {
    const data = await getSensorHistory(machine);
    if (!data || data.length === 0) return;
    sensorHistory = data.reverse();
    historyLabels = sensorHistory.map((_, i) => i);

    SENSORS.forEach(s => {
      const values = sensorHistory.map(d => d[s.key]).filter(v => v !== undefined);
      if (values.length > 0) {
        updateSparkline(`chart-${s.id}`, historyLabels.slice(-20), values.slice(-20));
        const latest = values[values.length - 1];
        const pct = Math.min(100, Math.max(0, ((latest - s.min) / (s.max - s.min)) * 100));
        updateDonut(`donut-${s.id}`, Math.round(pct));
      }
    });

    /* Danger chart */
    const latest = sensorHistory[sensorHistory.length - 1];
    if (latest) {
      const pcts = SENSORS.map(s => {
        const val = latest[s.key];
        if (val === undefined) return 0;
        return Math.min(100, Math.max(0, ((val - s.min) / (s.max - s.min)) * 100));
      });
      updateDangerChart(pcts);
    }
  } catch (_) {}
}

const SENSORS = [
  { key: 'temperature', id: 'temp',    name: 'Temperature', color: '#f59e0b', min: 0,  max: 100 },
  { key: 'vibration',   id: 'vib',     name: 'Vibration',   color: '#10b981', min: 0,  max: 100 },
  { key: 'noise',       id: 'noise',   name: 'Noise',       color: '#f97316', min: 0,  max: 100 },
  { key: 'gas',         id: 'gas',     name: 'Gas / AQI',   color: '#ef4444', min: 0,  max: 60  },
  { key: 'current',     id: 'current', name: 'Current',     color: '#8b5cf6', min: 0,  max: 20  },
  { key: 'load',        id: 'load',    name: 'Load',        color: '#9ca3af', min: 0,  max: 100 },
];

/* -- INIT CHARTS -- */
function initCharts() {
  if (typeof Chart === 'undefined') return;
  SENSORS.forEach(s => {
    createSparkline(`chart-${s.id}`, s.color);
    createDonut(`donut-${s.id}`, s.color);
  });
  createDangerChart(SENSORS);
  pollHistory();
  setInterval(pollHistory, 5000);
}

/* -- SENSOR POWER CONTROL FUNCTION -- */
function setSensorPower(sensor, isOn, save = true) {
  if (save) {
    localStorage.setItem(`sensor_power_${sensor}`, isOn);
  }
  sensorPower[sensor] = isOn;
  window.__sensorPower[sensor] = isOn;

  const onBtn  = document.getElementById(`power-on-${sensor}`);
  const offBtn = document.getElementById(`power-off-${sensor}`);
  if (onBtn)  onBtn.classList.toggle('active',  isOn);
  if (offBtn) offBtn.classList.toggle('active', !isOn);

  const card = document.getElementById(`card-${sensor}`);
  if (card) {
    card.style.opacity    = isOn ? '1'    : '0.35';
    card.style.filter     = isOn ? 'none' : 'grayscale(0.7)';
    card.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
    const valEl = card.querySelector('.sc-val');
    if (valEl) valEl.style.opacity = isOn ? '1' : '0.4';
  }
}

/* -- SIMULATOR TOGGLE -- */
const simToggle   = document.getElementById('simToggle');
const simLabel    = document.getElementById('simLabel');
const simStatus   = document.getElementById('simStatusText');

async function syncSimulatorState() {
  try {
    let { running } = await getSimulatorStatus();
    simToggle.checked = running;
    updateSimUI(running);

    if (running) {
      SENSORS.forEach(s => {
        const stored = localStorage.getItem(`sensor_power_${s.id}`);
        setSensorPower(s.id, stored !== null ? stored === 'true' : true, false);
      });
    }
  } catch (_) {
    simStatus.textContent = 'Backend offline';
    SENSORS.forEach(s => {
      const stored = localStorage.getItem(`sensor_power_${s.id}`);
      setSensorPower(s.id, stored !== null ? stored === 'true' : false, false);
    });
  }
}

function updateSimUI(running) {
  simLabel.textContent = running ? 'ON' : 'OFF';
  simLabel.classList.toggle('on', running);
  simStatus.textContent = running
    ? 'Simulator running -- sending data every 5 s'
    : 'Simulator idle';
}

simToggle.addEventListener('change', async () => {
  const running = simToggle.checked;
  simStatus.textContent = running ? 'Starting...' : 'Stopping...';
  localStorage.setItem('simulator_running', running);

  try {
    if (running) {
      await startSimulator();
      SENSORS.forEach(s => {
        const stored = localStorage.getItem(`sensor_power_${s.id}`);
        setSensorPower(s.id, stored !== null ? stored === 'true' : true, true);
      });
    } else {
      await stopSimulator();
      SENSORS.forEach(s => setSensorPower(s.id, false, false));
    }
    updateSimUI(running);
  } catch (_) {
    simStatus.textContent = 'Error communicating with backend';
    simToggle.checked = !running;
    localStorage.setItem('simulator_running', simToggle.checked);
  }
});

syncSimulatorState();

/* -- SENSOR NAV BUTTONS -- */
const sensorBtns = document.querySelectorAll('.sensor-btn');

sensorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sensorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const targetId = btn.dataset.target;
    const card = document.getElementById(targetId);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlighted');
      setTimeout(() => card.classList.remove('highlighted'), 1500);
    }
  });
});

/* -- SIDEBAR SENSOR POWER BUTTONS -- */
document.querySelectorAll('.spp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sensor = btn.dataset.sensor;
    const isOn   = btn.dataset.action === 'on';
    setSensorPower(sensor, isOn);
  });
});

/* -- 3D Mouse Tracking on sensor cards -- */
document.querySelectorAll('.sensor-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

/* -- Init charts on load -- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharts);
} else {
  initCharts();
}
