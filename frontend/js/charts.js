/* charts.js — manages all Chart.js instances for the IIoT dashboard */

const sparklines = {};

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

