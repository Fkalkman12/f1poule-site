const KLEUREN = ['#FFD24A', '#5B9BD5', '#E06B5C', '#7CC576', '#C97FE0', '#8C8C8C', '#E0A05B', '#5CCFC9', '#D55B9B', '#9BA8D5', '#C9C95C'];
const PATRONEN = [[], [6,3], [2,2], [8,3,2,3], [4,4], [10,2], [1,4], [6,2,2,2], [3,3], [12,4], [5,5,2,5]];
const MEDAILLES = ['🥇', '🥈', '🥉'];

// 2026 resterende racekalender (UTC race start tijden)
const KALENDER = [
  { naam: 'Oostenrijk',       datum: new Date('2026-06-28T13:00:00Z') },
  { naam: 'Groot-Brittannië', datum: new Date('2026-07-05T14:00:00Z') },
  { naam: 'België',           datum: new Date('2026-07-19T13:00:00Z') },
  { naam: 'Hongarije',        datum: new Date('2026-07-26T13:00:00Z') },
  { naam: 'Nederland',        datum: new Date('2026-08-23T13:00:00Z') },
  { naam: 'Italië',           datum: new Date('2026-09-06T13:00:00Z') },
  { naam: 'Spanje (Madrid)',  datum: new Date('2026-09-13T13:00:00Z') },
  { naam: 'Azerbeidzjan',     datum: new Date('2026-09-26T11:00:00Z') },
  { naam: 'Singapore',        datum: new Date('2026-10-11T12:00:00Z') },
  { naam: 'Verenigde Staten', datum: new Date('2026-10-25T19:00:00Z') },
  { naam: 'Mexico',           datum: new Date('2026-11-01T20:00:00Z') },
  { naam: 'Brazilië',         datum: new Date('2026-11-08T17:00:00Z') },
  { naam: 'Las Vegas',        datum: new Date('2026-11-22T06:00:00Z') },
  { naam: 'Qatar',            datum: new Date('2026-11-29T16:00:00Z') },
  { naam: 'Abu Dhabi',        datum: new Date('2026-12-06T13:00:00Z') },
];

let grafiek = null;
let actieveSpelers = new Set();

// ─── Data helpers ─────────────────────────────────────────────────────────────

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

function puntenPerRace(naam, spelers) {
  const cumulatief = spelers[naam];
  return cumulatief.map((p, i) => i === 0 ? p : p - cumulatief[i - 1]);
}

function kleurVoorNaam(naam, spelers) {
  const idx = Object.keys(spelers).indexOf(naam);
  return KLEUREN[idx % KLEUREN.length];
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function volgendeRace() {
  const nu = new Date();
  return KALENDER.find(r => r.datum > nu) || null;
}

function startCountdown() {
  const race = volgendeRace();
  if (!race) return;

  document.getElementById('next-race-naam').textContent = race.naam;

  // Deadline banner: toon als race binnen 7 dagen is
  const msOver = race.datum - new Date();
  const dagenOver = msOver / (1000 * 60 * 60 * 24);
  if (dagenOver <= 7) {
    const banner = document.getElementById('deadline-banner');
    banner.classList.add('zichtbaar');
    document.getElementById('deadline-tekst').textContent =
      `🏁 ${race.naam} komt eraan — vul je poule in voor de race start!`;
  }

  function tick() {
    const nu = new Date();
    const diff = race.datum - nu;
    if (diff <= 0) {
      document.getElementById('cd-d').textContent = '0';
      document.getElementById('cd-h').textContent = '0';
      document.getElementById('cd-m').textContent = '0';
      document.getElementById('deadline-countdown').textContent = 'Race is begonnen!';
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-d').textContent = d;
    document.getElementById('cd-h').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(m).padStart(2, '0');
    document.getElementById('deadline-countdown').textContent =
      `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ─── Banner ───────────────────────────────────────────────────────────────────

function vulBanner(leider) {
  document.getElementById('leader-naam').textContent = leider.naam;
  document.getElementById('stat-leider').textContent = leider.naam;
  document.getElementById('stat-punten').textContent = leider.punten;
}

function vulStats(races) {
  document.getElementById('stat-races').textContent = `${races.length} / 24`;
}

// ─── Podium ───────────────────────────────────────────────────────────────────

function vulPodium(stand) {
  const wrap = document.getElementById('podium');
  const volgorde = [stand[1], stand[0], stand[2]]; // 2e, 1e, 3e
  const hoogtes = [1, 0, 2]; // index in stand
  wrap.innerHTML = '';
  volgorde.forEach((s, i) => {
    if (!s) return;
    const div = document.createElement('div');
    div.className = `podium-item podium-${hoogtes[i] + 1}`;
    div.innerHTML = `
      <div class="podium-naam">${s.naam}</div>
      <div class="podium-punten">${s.punten}pt</div>
      <div class="podium-blok">${MEDAILLES[s.plek - 1]}</div>
    `;
    wrap.appendChild(div);
  });
}

// ─── Tabel ────────────────────────────────────────────────────────────────────

function vulTabel(stand, spelers) {
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
    tr.querySelector('.naam').addEventListener('click', () => openSpelerModal(s.naam, stand, spelers));
    body.appendChild(tr);
  });
}

function pasTabelAan() {
  document.querySelectorAll('#standings-body tr').forEach(tr => {
    const naam = tr.dataset.naam;
    const niemandActief = actieveSpelers.size === 0;
    tr.classList.toggle('actief-rij', !niemandActief && actieveSpelers.has(naam));
  });
}

// ─── Legenda ──────────────────────────────────────────────────────────────────

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

function pasLegendaAan() {
  document.querySelectorAll('.legend-item').forEach(el => {
    const naam = el.dataset.naam;
    const niemandActief = actieveSpelers.size === 0;
    el.classList.toggle('actief', actieveSpelers.has(naam));
    el.classList.toggle('gedempt', !niemandActief && !actieveSpelers.has(naam));
  });
}

// ─── Grafiek toggle ───────────────────────────────────────────────────────────

function toggleSpeler(naam) {
  if (actieveSpelers.has(naam)) actieveSpelers.delete(naam);
  else actieveSpelers.add(naam);
  pasGrafiekAan();
  pasLegendaAan();
  pasTabelAan();
}

function pasGrafiekAan() {
  if (!grafiek) return;
  const niemandActief = actieveSpelers.size === 0;
  grafiek.data.datasets.forEach((ds, i) => {
    grafiek.setDatasetVisibility(i, niemandActief || actieveSpelers.has(ds.label));
  });
  grafiek.update();
}

// ─── Race detail panel ────────────────────────────────────────────────────────

function toonRaceDetail(raceIndex, races, spelers) {
  const racenaam = races[raceIndex];
  const resultaten = Object.entries(spelers)
    .map(([naam, punten]) => ({
      naam,
      punten: raceIndex === 0 ? punten[0] : punten[raceIndex] - punten[raceIndex - 1],
    }))
    .sort((a, b) => b.punten - a.punten);

  document.getElementById('race-detail-titel').textContent = `📊 ${racenaam} — race punten`;
  const grid = document.getElementById('race-detail-grid');
  grid.innerHTML = '';
  resultaten.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = `race-detail-item${i === 0 ? ' top1' : ''}`;
    div.innerHTML = `<span class="rd-naam">${MEDAILLES[i] ?? (i+1)+'.'} ${r.naam}</span><span class="rd-pts">+${r.punten}</span>`;
    grid.appendChild(div);
  });

  document.getElementById('race-detail').style.display = 'block';
  document.getElementById('race-detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Grafiek ──────────────────────────────────────────────────────────────────

function tekenGrafiek(races, spelers) {
  const namen = Object.keys(spelers);
  const datasets = namen.map((naam, i) => ({
    label: naam,
    data: spelers[naam],
    borderColor: KLEUREN[i % KLEUREN.length],
    backgroundColor: KLEUREN[i % KLEUREN.length],
    borderDash: PATRONEN[i % PATRONEN.length],
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 7,
    tension: 0.3,
    fill: false,
  }));

  grafiek = new Chart(document.getElementById('poulechart'), {
    type: 'line',
    data: { labels: races, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (evt, elements) => {
        if (!elements.length) return;
        const raceIndex = elements[0].index;
        toonRaceDetail(raceIndex, races, spelers);
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const naam = ctx.dataset.label;
              const idx = ctx.dataIndex;
              const cum = ctx.parsed.y;
              const perRace = idx === 0 ? cum : cum - spelers[naam][idx - 1];
              return `${naam}: ${cum}pt (+${perRace} deze race)`;
            }
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'Punten', color: 'rgba(255,255,255,0.5)' },
          beginAtZero: true,
          ticks: { color: 'rgba(255,255,255,0.5)' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        },
        x: {
          ticks: { color: 'rgba(255,255,255,0.5)' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  });
}

// ─── Speler modal ─────────────────────────────────────────────────────────────

function openSpelerModal(naam, stand, spelers) {
  const puntenArr = spelers[naam];
  const perRace = puntenArr.map((p, i) => i === 0 ? p : p - puntenArr[i - 1]);
  const totaal = puntenArr[puntenArr.length - 1];
  const beste = Math.max(...perRace);
  const gem = Math.round(totaal / puntenArr.length);
  const spelerStand = stand.find(s => s.naam === naam);
  const kleur = kleurVoorNaam(naam, spelers);
  const maxPerRace = Math.max(...Object.values(spelers).flatMap((p, i) =>
    p.map((v, j) => j === 0 ? v : v - p[j-1])
  ));

  document.getElementById('modal-naam').textContent = naam;
  document.getElementById('modal-rang').textContent = `${MEDAILLES[spelerStand.plek-1] ?? '#'+spelerStand.plek} ${spelerStand.plek}e plaats · ${totaal} punten totaal`;
  document.getElementById('modal-totaal').textContent = totaal;
  document.getElementById('modal-beste').textContent = `+${beste}`;
  document.getElementById('modal-gem').textContent = `+${gem}`;

  const { races } = POULE_DATA;
  const racesDiv = document.getElementById('modal-races');
  racesDiv.innerHTML = '';
  races.forEach((race, i) => {
    const pts = perRace[i];
    const breedte = Math.round((pts / maxPerRace) * 100);
    const row = document.createElement('div');
    row.className = 'modal-race-row';
    row.innerHTML = `
      <span class="modal-race-naam">${race}</span>
      <div class="modal-race-bar-wrap">
        <div class="modal-race-bar" style="width:${breedte}%;background:${kleur}"></div>
      </div>
      <span class="modal-race-pts">+${pts}</span>
    `;
    racesDiv.appendChild(row);
  });

  document.getElementById('speler-modal').classList.add('open');
}

document.getElementById('modal-sluit').addEventListener('click', () => {
  document.getElementById('speler-modal').classList.remove('open');
});
document.getElementById('speler-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

// ─── Kart animatie ────────────────────────────────────────────────────────────

function animeerKart() {
  const car = document.getElementById('car');
  const track = car.closest('.track');

  function rijden() {
    const breedte = track.offsetWidth + 380;
    car.style.transition = 'none';
    car.style.left = '-400px';
    void car.offsetLeft;
    car.style.transition = 'left 14s linear';
    car.style.left = breedte + 'px';
    setTimeout(rijden, 14500);
  }
  rijden();
}

// ─── Init ─────────────────────────────────────────────────────────────────────

(function init() {
  const { races, spelers } = POULE_DATA;
  const stand = bepaalStand(spelers, races);
  const namenInGrafiekVolgorde = Object.keys(spelers);

  vulBanner(stand[0]);
  vulStats(races);
  vulPodium(stand);
  vulTabel(stand, spelers);
  vulLegende(namenInGrafiekVolgorde);
  tekenGrafiek(races, spelers);
  animeerKart();
  startCountdown();
})();
