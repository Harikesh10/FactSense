/* dashboard.js — wires API data to the dashboard UI */

import { getLatestSensorData, getMachineStatus } from './api.js';

/* ── SENSOR CONFIG ── */
const SENSORS = [
  { key: 'temperature', id: 'temp',    name: 'Temperature', color: '#f59e0b', min: 0,  max: 100, thresh: 70  },
  { key: 'vibration',   id: 'vib',     name: 'Vibration',   color: '#10b981', min: 0,  max: 100, thresh: 65  },
  { key: 'noise',       id: 'noise',   name: 'Noise',       color: '#f97316', min: 0,  max: 100, thresh: 65  },
  { key: 'gas',         id: 'gas',     name: 'Gas / AQI',   color: '#ef4444', min: 0,  max: 60,  thresh: 35  },
  { key: 'current',     id: 'current', name: 'Current',     color: '#8b5cf6', min: 0,  max: 20,  thresh: 14  },
];

SENSORS.forEach(s => s.threshPct = Math.round((s.thresh / s.max) * 100));

/* ── helpers ── */
function toPct(val, min, max) {
  return Math.min(100, Math.max(0, Math.round(((val - min) / (max - min)) * 100)));
}

function getStatus(pct, threshPct) {
  if (pct >= threshPct)                    return 'danger';
  if (pct >= Math.round(threshPct * 0.80)) return 'warn';
  return 'ok';
}

function setPill(id, status) {
  const el = document.getElementById(`pill-${id}`);
  if (!el) return;
  el.className = 'status-pill';
  const map = { ok: ['pill-ok', 'Normal'], warn: ['pill-warn', 'Warning'], danger: ['pill-danger', 'Danger'] };
  const [cls, lbl] = map[status] || ['pill-none', '—'];
  el.classList.add(cls);
  el.textContent = lbl;
}

/* ── MAIN POLL: load latest readings ── */
export async function loadDashboard(machine) {
  const latest = await getLatestSensorData(machine).catch(() => null);
  if (!latest || latest.message) return;

  SENSORS.forEach(s => {
    const val = latest[s.key];
    if (val === undefined || val === null) return;

    /* Big value display */
    const el = document.getElementById(s.key);
    if (el) el.textContent = val.toFixed(2);

    /* Sidebar mini value */
    const sval = document.getElementById(`sval-${s.id}`);
    if (sval) sval.textContent = val.toFixed(1);

    /* Progress bar */
    const pct = toPct(val, s.min, s.max);
    const prog = document.getElementById(`prog-${s.id}`);
    if (prog) prog.style.width = pct + '%';
    const pctEl = document.getElementById(`pct-${s.id}`);
    if (pctEl) pctEl.textContent = pct + '% of range';

    /* Status pill */
    const st = getStatus(pct, s.threshPct);
    setPill(s.id, st);
  });

  /* Machine status */
  const statusData = await getMachineStatus(machine).catch(() => null);
  if (!statusData || statusData.message) return;

  const status = statusData.status; // "SAFE" | "WARNING" | "DANGER"
  const statusKey = status.toLowerCase(); // "safe" | "warning" | "danger"

  /* Topbar status chip */
  const chipVal = document.getElementById('status');
  const chipIndicator = document.getElementById('statusIndicator');
  const chipCard = document.getElementById('topbar-status-card');

  if (chipVal) {
    chipVal.textContent = status;
    chipVal.className = 'tscard-value ' + statusKey;
  }
  if (chipIndicator) {
    chipIndicator.className = 'tscard-indicator ' + statusKey;
  }
  if (chipCard) {
    chipCard.className = 'topbar-status-card ' + statusKey;
  }

  /* Sidebar hint */
  const hintEl = document.getElementById('statusHint');
  if (hintEl) {
    const hints = {
      SAFE:    'All sensors within normal operating range.',
      WARNING: 'One or more sensors approaching threshold.',
      DANGER:  'Critical readings detected — take action!',
    };
    hintEl.textContent = hints[status] || '';
  }
}
