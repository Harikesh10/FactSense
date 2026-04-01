/* main.js — entry point: machine selector, polling, simulator toggle, sensor nav */

import { loadDashboard } from './dashboard.js';
import { getSimulatorStatus, startSimulator, stopSimulator } from './api.js';

let machine = 'MACHINE_1';

/* ── CLOCK ── */
function tickClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
}
setInterval(tickClock, 1000);
tickClock();

/* ── MACHINE SELECTOR ── */
document.getElementById('machineSelector').addEventListener('change', (e) => {
  machine = e.target.value;
  loadDashboard(machine);
});

/* ── POLLING ── */
async function poll() {
  await loadDashboard(machine);
}
poll();
setInterval(poll, 5000);

/* ── SIMULATOR TOGGLE ── */
const simToggle   = document.getElementById('simToggle');
const simLabel    = document.getElementById('simLabel');
const simStatus   = document.getElementById('simStatusText');

async function syncSimulatorState() {
  try {
    const { running } = await getSimulatorStatus();
    simToggle.checked = running;
    updateSimUI(running);
  } catch (_) {
    simStatus.textContent = 'Backend offline';
  }
}

function updateSimUI(running) {
  simLabel.textContent = running ? 'ON' : 'OFF';
  simLabel.classList.toggle('on', running);
  simStatus.textContent = running
    ? 'Simulator running — sending data every 5 s'
    : 'Simulator idle';
}

simToggle.addEventListener('change', async () => {
  const running = simToggle.checked;
  simStatus.textContent = running ? 'Starting…' : 'Stopping…';
  try {
    if (running) {
      await startSimulator();
    } else {
      await stopSimulator();
    }
    updateSimUI(running);
  } catch (_) {
    simStatus.textContent = 'Error communicating with backend';
    simToggle.checked = !running; // revert
  }
});

syncSimulatorState();

/* ── SENSOR NAV BUTTONS ── */
const sensorBtns = document.querySelectorAll('.sensor-btn');

sensorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    /* Toggle active state */
    sensorBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    /* Scroll to & highlight the target card */
    const targetId = btn.dataset.target;
    const card = document.getElementById(targetId);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('highlighted');
      setTimeout(() => card.classList.remove('highlighted'), 1500);
    }
  });
});

/* ── SIDEBAR SENSOR POWER BUTTONS ── */
document.querySelectorAll('.spp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sensor = btn.dataset.sensor;
    const isOn   = btn.dataset.action === 'on';

    // Swap active highlight between ON / OFF
    const onBtn  = document.getElementById(`power-on-${sensor}`);
    const offBtn = document.getElementById(`power-off-${sensor}`);
    if (onBtn)  onBtn.classList.toggle('active',  isOn);
    if (offBtn) offBtn.classList.toggle('active', !isOn);

    // Dim / restore the matching sensor card
    const card = document.getElementById(`card-${sensor}`);
    if (card) {
      card.style.opacity    = isOn ? '1'    : '0.35';
      card.style.filter     = isOn ? 'none' : 'grayscale(0.7)';
      card.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
      // Freeze the value display when OFF
      const valEl = card.querySelector('.sc-val');
      if (valEl) valEl.style.opacity = isOn ? '1' : '0.4';
    }
  });
});
