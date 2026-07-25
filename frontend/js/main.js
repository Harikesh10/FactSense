import { loadDashboard } from './dashboard.js';
import { createSparkline, updateSparkline } from './charts.js';
import { getSimulatorStatus, startSimulator, stopSimulator, getSensorHistory } from './api.js';

let machine = 'MACHINE_1';
let sensorHistory = [];
let historyLabels = [];

/* Sensor power state - exposed for dashboard.js
   Restore from localStorage immediately so UI is correct on refresh */
const sensorPower = {
  temp: true,
  vib: true,
  noise: true,
  gas: true,
  current: true,
  load: true,
};
window.__sensorPower = sensorPower;

/* Immediately restore sensor power from localStorage */
function restoreSensorPowerFromStorage() {
  const ids = ['temp', 'vib', 'noise', 'gas', 'current', 'load'];
  const simRunning = localStorage.getItem('simulator_running') !== 'false'; // defaults to true if not set
  
  ids.forEach(id => {
    const stored = localStorage.getItem(`sensor_power_${id}`);
    if (stored !== null) {
      let isOn = stored === 'true';
      if (!simRunning) isOn = false; // Override to off if simulator is off
      
      sensorPower[id] = isOn;
      window.__sensorPower[id] = isOn;

      const btn = document.getElementById(`circle-btn-${id}`);
      const statusEl = document.getElementById(`status-${id}`);
      if (btn) {
        btn.classList.toggle('active', isOn);
        btn.classList.toggle('off', !isOn);
      }
      if (statusEl) {
        statusEl.textContent = isOn ? 'ON' : 'OFF';
      }

      const card = document.getElementById(`card-${id}`);
      if (card) {
        card.style.opacity    = isOn ? '1'    : '0.35';
        card.style.filter     = isOn ? 'none' : 'grayscale(0.7)';
        const valEl = card.querySelector('.sc-val');
        if (valEl) valEl.style.opacity = isOn ? '1' : '0.4';
      }
      
      // Instant UI update for OFF state
      if (!isOn) {
        // Clear numerical value
        const valIds = { temp: 'temperature', vib: 'vibration', noise: 'noise', gas: 'gas', current: 'current', load: 'load' };
        const valId = valIds[id];
        if (valId) {
          const vEl = document.getElementById(valId);
          if (vEl) vEl.textContent = '--';
        }
        
        // Clear other indicators
        const pctEl = document.getElementById(`pct-${id}`);
        if (pctEl) pctEl.textContent = '--';
        
        const progEl = document.getElementById(`prog-${id}`);
        if (progEl) progEl.style.width = '0%';
        
        const pillEl = document.getElementById(`pill-${id}`);
        if (pillEl) {
          pillEl.textContent = '—';
          pillEl.className = 'status-pill';
        }
        
        // Clear sparkline immediately
        if (typeof updateSparkline === 'function') {
          updateSparkline(`chart-${id}`, [], []);
        }
      }
    }
  });
}
restoreSensorPowerFromStorage();

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
      const isPowered = sensorPower[s.id] !== false;
      const values = sensorHistory.map(d => d[s.key]).filter(v => v !== undefined);
      if (values.length > 0) {
        if (isPowered) {
          updateSparkline(`chart-${s.id}`, historyLabels.slice(-20), values.slice(-20));
        } else {
          updateSparkline(`chart-${s.id}`, [], []);
        }
      }
    });
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
  });
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

  const btn = document.getElementById(`circle-btn-${sensor}`);
  const statusEl = document.getElementById(`status-${sensor}`);
  if (btn) {
    btn.classList.toggle('active', isOn);
    btn.classList.toggle('off', !isOn);
  }
  if (statusEl) {
    statusEl.textContent = isOn ? 'ON' : 'OFF';
  }

  const card = document.getElementById(`card-${sensor}`);
  if (card) {
    card.style.opacity    = isOn ? '1'    : '0.35';
    card.style.filter     = isOn ? 'none' : 'grayscale(0.7)';
    card.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
    const valEl = card.querySelector('.sc-val');
    if (valEl) valEl.style.opacity = isOn ? '1' : '0.4';
  }

  // Instant UI update for OFF state
  if (!isOn) {
    // Clear numerical value
    const valIds = { temp: 'temperature', vib: 'vibration', noise: 'noise', gas: 'gas', current: 'current', load: 'load' };
    const valId = valIds[sensor];
    if (valId) {
      const vEl = document.getElementById(valId);
      if (vEl) vEl.textContent = '--';
    }
    
    // Clear other indicators
    const pctEl = document.getElementById(`pct-${sensor}`);
    if (pctEl) pctEl.textContent = '--';
    
    const progEl = document.getElementById(`prog-${sensor}`);
    if (progEl) progEl.style.width = '0%';
    
    const pillEl = document.getElementById(`pill-${sensor}`);
    if (pillEl) {
      pillEl.textContent = '—';
      pillEl.className = 'status-pill';
    }
    
    // Clear sparkline immediately
    if (typeof updateSparkline === 'function') {
      updateSparkline(`chart-${sensor}`, [], []);
    }
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
    } else {
      SENSORS.forEach(s => setSensorPower(s.id, false, false));
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

/* -- ROUND SENSOR TOGGLE BUTTONS -- */
document.querySelectorAll('.sensor-circle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sensor = btn.dataset.sensor;
    const currentState = sensorPower[sensor] !== false;
    setSensorPower(sensor, !currentState);

    const targetId = btn.dataset.target;
    const card = document.getElementById(targetId);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlighted');
      setTimeout(() => card.classList.remove('highlighted'), 1500);
    }
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
