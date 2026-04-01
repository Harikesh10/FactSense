/* charts.js — manages all Chart.js instances for the IIoT dashboard */

const sparklines = {};
const donuts     = {};
let   dangerBar  = null;

const COLORS = {
  temp:    '#f59e0b',
  vib:     '#10b981',
  noise:   '#f97316',
  gas:     '#ef4444',
  current: '#8b5cf6'
};

/* ── SPARKLINES (per-sensor trend line inside each card) ── */
export function createSparkline(id, color) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  sparklines[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderColor: color,
        borderWidth: 2,
        fill: true,
        backgroundColor: color + '22',
        pointRadius: 0,
        tension: 0.4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales:  { x: { display: false }, y: { display: false } },
      animation: { duration: 400 }
    }
  });
}

export function updateSparkline(id, labels, data) {
  const c = sparklines[id];
  if (!c) return;
  c.data.labels                = labels.slice(-20);
  c.data.datasets[0].data      = data.slice(-20);
  c.update('none');
}

/* ── DONUT CHARTS (data coverage %) ── */
export function createDonut(id, color) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  donuts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [0, 100],
        backgroundColor: [color, '#1a1e28'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '72%', responsive: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { duration: 800, easing: 'easeOutQuart' }
    }
  });
}

export function updateDonut(id, pct) {
  const c = donuts[id];
  if (!c) return;
  c.data.datasets[0].data = [pct, 100 - pct];
  c.update();
}

/* ── DANGER BAR CHART ── */
export function createDangerChart(sensors) {
  const ctx = document.getElementById('dangerChart');
  if (!ctx) return;

  dangerBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sensors.map(s => s.name),
      datasets: [
        {
          label: 'Current value (%)',
          data: sensors.map(() => 0),
          backgroundColor: sensors.map(s => s.color + 'cc'),
          borderColor:     sensors.map(s => s.color),
          borderWidth: 1, borderRadius: 7
        },
        {
          label: 'Danger threshold (%)',
          data: sensors.map(s => s.threshPct),
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.22)',
          borderWidth: 1, borderRadius: 7
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: 'rgba(255,255,255,0.45)', font: { size: 11 }, boxWidth: 10, padding: 18 }
        },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(0)}%` }
        }
      },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.45)', font: { size: 12 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          min: 0, max: 100,
          ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 11 }, callback: v => v + '%' },
          grid:  { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

export function updateDangerChart(values) {
  if (!dangerBar) return;
  dangerBar.data.datasets[0].data = values;
  dangerBar.update();
}
