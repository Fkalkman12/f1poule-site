const KLEUREN = ['#FFD24A', '#5B9BD5', '#E06B5C', '#7CC576', '#C97FE0', '#8C8C8C', '#E0A05B', '#5CCFC9', '#D55B9B', '#9BA8D5', '#C9C95C'];
const PATRONEN = [[], [6,3], [2,2], [8,3,2,3], [4,4], [10,2], [1,4], [6,2,2,2], [3,3], [12,4], [5,5,2,5]];
const MEDAILLES = ['🥇', '🥈', '🥉'];

let grafiek = null;
let actieveSpelers = new Set();

function bepaalStand(spelers, races) {
  const laatsteIdx = races.length - 1;
  const vorigeIdx = races.length - 2;
  return Object.entries(spelers)
    .map(([naam, punten]) => ({
      naam,
      punten: punten[laatsteIdx],
      laasteRace: vorigeIdx >= 0 ? punten[laatsteIdx] - punten[vorigeIdx] : punten[laatsteIdx],
    }))
    .sort((a, b) => b.punten - a.punten)
    .map((s, i, arr) => ({ ...s, plek: i + 1, gap: i === 0 ? 0 : s.punten - arr[0].punten }));
}

function vulBanner(leider) {
  document.getElementById('leader-naam').textContent = leider.naam;
  document.getElementById('stat-leider').textContent = leider.naam;
  document.getElementById('stat-punten').textContent = leider.punten;
}

function vulStats(races) {
  document.getElementById('stat-races').textContent = `${races.length} / 24`;
}

function toggleSpeler(naam) {
  if (actieveSpelers.has(naam)) {
    actieveSpelers.delete(naam);
  } else {
    actieveSpelers.add(naam);
  }
  pasGrafiekAan();
  pasLegendaAan();
  pasTabelAan();
}

function pasGrafiekAan() {
  if (!grafiek) return;
  const niemandActief = actieveSpelers.size === 0;
  grafiek.data.datasets.forEach((ds, i) => {
    const zichtbaar = niemandActief || actieveSpelers.has(ds.label);
    grafiek.setDatasetVisibility(i, zichtbaar);
  });
  grafiek.update();
}

function pasLegendaAan() {
  document.querySelectorAll('.legend-item').forEach(el => {
    const naam = el.dataset.naam;
    const niemandActief = actieveSpelers.size === 0;
    el.classList.toggle('actief', actieveSpelers.has(naam));
    el.classList.toggle('gedempt', !niemandActief && !actieveSpelers.has(naam));
  });
}

function pasTabelAan() {
  document.querySelectorAll('#standings-body tr').forEach(tr => {
    const naam = tr.dataset.naam;
    const niemandActief = actieveSpelers.size === 0;
    tr.classList.toggle('actief-rij', !niemandActief && actieveSpelers.has(naam));
  });
}

function vulTabel(stand) {
  const body = document.getElementById('standings-body');
  body.innerHTML = '';
  stand.forEach(s => {
    const tr = document.createElement('tr');
    tr.dataset.naam = s.naam;
    if (s.plek === 1) tr.className = 'top1';
    else if (s.plek === 2) tr.className = 'top2';
    else if (s.plek === 3) tr.className = 'top3';

    const medaille = MEDAILLES[s.plek - 1] ?? s.plek;
    const gapTekst = s.gap === 0 ? '—' : s.gap;
    const laasteKleur = s.laasteRace > 0 ? '#7CC576' : 'rgba(255,255,255,0.55)';

    tr.innerHTML = `
      <td class="pos">${medaille}</td>
      <td class="naam">${s.naam}</td>
      <td class="pts">${s.punten}</td>
      <td class="gap">${gapTekst}</td>
      <td class="laaste" style="color:${laasteKleur}">+${s.laasteRace}</td>
    `;

    tr.querySelector('.naam').addEventListener('click', () => toggleSpeler(s.naam));
    body.appendChild(tr);
  });
}

function vulLegende(namen) {
  const legend = document.getElementById('legend');
  legend.innerHTML = '';
  namen.forEach((naam, i) => {
    const kleur = KLEUREN[i % KLEUREN.length];
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.dataset.naam = naam;
    item.innerHTML = `<span class="dot" style="background:${kleur}"></span>${naam}`;
    item.addEventListener('click', () => toggleSpeler(naam));
    legend.appendChild(item);
  });
}

function tekenGrafiek(races, spelers) {
  const namen = Object.keys(spelers);
  const datasets = namen.map((naam, i) => ({
    label: naam,
    data: spelers[naam],
    borderColor: KLEUREN[i % KLEUREN.length],
    backgroundColor: KLEUREN[i % KLEUREN.length],
    borderDash: PATRONEN[i % PATRONEN.length],
    borderWidth: 2,
    pointRadius: 3,
    tension: 0.3,
    fill: false,
  }));

  grafiek = new Chart(document.getElementById('poulechart'), {
    type: 'line',
    data: { labels: races, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          title: { display: true, text: 'Punten', color: 'rgba(255,255,255,0.5)' },
          beginAtZero: true,
          ticks: { color: 'rgba(255,255,255,0.5)' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        },
        x: {
          title: { display: true, text: 'Race', color: 'rgba(255,255,255,0.5)' },
          ticks: { color: 'rgba(255,255,255,0.5)' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  });
}

function animeerKart() {
  const car = document.getElementById('car');
  const track = car.closest('.track');
  let looptimer = null;

  function rijden() {
    const breedte = track.offsetWidth + 380;
    car.style.transition = 'none';
    car.style.left = '-340px';
    // forceer reflow zodat de reset zichtbaar is vóór de animatie start
    void car.offsetLeft;
    car.style.transition = `left 14s linear`;
    car.style.left = breedte + 'px';
    looptimer = setTimeout(rijden, 14500);
  }

  rijden();
}

(function init() {
  const { races, spelers } = POULE_DATA;
  const stand = bepaalStand(spelers, races);
  const namenInGrafiekVolgorde = Object.keys(spelers);

  vulBanner(stand[0]);
  vulStats(races);
  vulTabel(stand);
  vulLegende(namenInGrafiekVolgorde);
  tekenGrafiek(races, spelers);
  animeerKart();
})();
