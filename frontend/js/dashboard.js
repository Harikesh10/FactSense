import { getLatestSensorData, getMachineStatus } from './api.js';

const SENSORS = [
  { key: 'temperature', id: 'temp',    name: 'Temperature', color: '#f59e0b', min: 0,  max: 100, thresh: 70  },
  { key: 'vibration',   id: 'vib',     name: 'Vibration',   color: '#10b981', min: 0,  max: 100, thresh: 65  },
  { key: 'noise',       id: 'noise',   name: 'Noise',       color: '#f97316', min: 0,  max: 100, thresh: 65  },
  { key: 'gas',         id: 'gas',     name: 'Gas / AQI',   color: '#ef4444', min: 0,  max: 60,  thresh: 35  },
  { key: 'current',     id: 'current', name: 'Current',     color: '#8b5cf6', min: 0,  max: 20,  thresh: 14  },
  { key: 'load',        id: 'load',    name: 'Load',        color: '#9ca3af', min: 0,  max: 100, thresh: 40  },
];

SENSORS.forEach(s => s.threshPct = Math.round((s.thresh / s.max) * 100));

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
  const [cls, lbl] = map[status] || ['pill-none', '--'];
  el.classList.add(cls);
  el.textContent = lbl;
}

export async function loadDashboard(machine) {
  const latest = await getLatestSensorData(machine).catch(() => null);
  if (!latest || latest.message) return;

  /* Check sensor power from global (set by main.js) */
  const powerState = (typeof window !== 'undefined' && window.__sensorPower)
    ? window.__sensorPower
    : { temp: true, vib: true, noise: true, gas: true, current: true, load: true };

  SENSORS.forEach(s => {
    const val = latest[s.key];
    if (val === undefined || val === null) return;

    const isPowered = powerState[s.id] !== false;

    const el = document.getElementById(s.key);
    if (el) {
      el.textContent = isPowered ? val.toFixed(2) : '--';
      el.style.opacity = isPowered ? '1' : '0.4';
    }

    const sval = document.getElementById(`sval-${s.id}`);
    if (sval) {
      sval.textContent = isPowered ? val.toFixed(1) : '--';
    }

    const pct = toPct(val, s.min, s.max);
    const prog = document.getElementById(`prog-${s.id}`);
    if (prog) prog.style.width = (isPowered ? pct : 0) + '%';

    const pctEl = document.getElementById(`pct-${s.id}`);
    if (pctEl) pctEl.textContent = isPowered ? pct + '% of range' : '--';

    const st = isPowered ? getStatus(pct, s.threshPct) : 'ok';
    setPill(s.id, st);
  });

  const statusData = await getMachineStatus(machine).catch(() => null);
  if (!statusData || statusData.message) return;

  const status = statusData.status;
  const statusKey = status.toLowerCase();

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

  const hintEl = document.getElementById('statusHint');
  if (hintEl) {
    const hints = {
      SAFE:    'All sensors within normal operating range.',
      WARNING: 'One or more sensors approaching threshold.',
      DANGER:  'Critical readings detected -- take action!',
    };
    hintEl.textContent = hints[status] || '';
  }
}
