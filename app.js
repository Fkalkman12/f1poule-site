// F1 Poule 2026 — app.js

const KALENDER = [
  { naam: 'Oostenrijk',    datum: new Date('2026-06-28T13:00:00Z') },
  { naam: 'Silverstone',   datum: new Date('2026-07-05T14:00:00Z') },
  { naam: 'Hongarije',     datum: new Date('2026-07-19T13:00:00Z') },
  { naam: 'Belgie',        datum: new Date('2026-07-26T13:00:00Z') },
  { naam: 'Nederland',     datum: new Date('2026-08-30T13:00:00Z') },
  { naam: 'Monza',         datum: new Date('2026-09-06T13:00:00Z') },
  { naam: 'Azerbeidzjan',  datum: new Date('2026-09-20T11:00:00Z') },
  { naam: 'Singapore',     datum: new Date('2026-10-04T09:00:00Z') },
  { naam: 'Texas',         datum: new Date('2026-10-18T19:00:00Z') },
  { naam: 'Mexico',        datum: new Date('2026-10-25T20:00:00Z') },
  { naam: 'Sao Paulo',     datum: new Date('2026-11-08T17:00:00Z') },
  { naam: 'Las Vegas',     datum: new Date('2026-11-21T06:00:00Z') },
  { naam: 'Qatar',         datum: new Date('2026-11-29T13:00:00Z') },
  { naam: 'Abu Dhabi',     datum: new Date('2026-12-06T13:00:00Z') },
];

const KLEUREN = [
  '#E10600','#FFD24A','#7CC576','#5B9BD5','#FF7F50',
  '#B39DDB','#4DB6AC','#FF8A65','#90A4AE','#F06292','#A5D6A7',
];

// ── Hulpfuncties ──────────────────────────────────────────────

function kleurVoor(naam) {
  const namen = Object.keys(POULE_DATA.spelers);
  return KLEUREN[namen.indexOf(naam) % KLEUREN.length];
}

function stand() {
  const n = POULE_DATA.races.length;
  return Object.entries(POULE_DATA.spelers)
    .map(([naam, punten]) => ({ naam, punten: punten[n - 1] || 0 }))
    .sort((a, b) => b.punten - a.punten);
}

function puntenPerRace(naam) {
  const reeks = POULE_DATA.spelers[naam];
  return reeks.map((p, i) => i === 0 ? p : p - reeks[i - 1]);
}

function kortNaam(naam) {
  return naam.replace(/\d+$/, '').trim();
}

// ── Tabs ──────────────────────────────────────────────────────

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('actief'));
    document.querySelectorAll('.tab-inhoud').forEach(t => t.classList.remove('actief'));
    btn.classList.add('actief');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('actief');
    if (btn.dataset.tab === 'grafiek' && !grafiekGemaakt) maakGrafiek();
    if (btn.dataset.tab === 'vergelijk') vulH2H();
  });
});

// ── Countdown ──────────────────────────────────────────────────

function startCountdown() {
  const nu = new Date();
  const volgende = KALENDER.find(r => r.datum > nu);
  if (!volgende) {
    document.getElementById('next-race-naam').textContent = 'Seizoen voorbij 🏁';
    return;
  }
  document.getElementById('next-race-naam').textContent = volgende.naam;
  function tick() {
    const diff = volgende.datum - new Date();
    if (diff <= 0) { startCountdown(); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    document.getElementById('cd-d').textContent = d;
    document.getElementById('cd-h').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-m').textContent = String(m).padStart(2,'0');
  }
  tick();
  setInterval(tick, 30000);
}

// ── Deadline banner ────────────────────────────────────────────

function checkDeadlineBanner() {
  const nu = new Date();
  const volgende = KALENDER.find(r => r.datum > nu);
  if (!volgende) return;
  const kwal = new Date(volgende.datum.getTime() - 24 * 3600000);
  const diff = kwal - nu;
  if (diff > 0 && diff < 48 * 3600000) {
    const banner = document.getElementById('deadline-banner');
    banner.classList.add('zichtbaar');
    document.getElementById('deadline-tekst').textContent =
      `Kwalificatie ${volgende.naam} begint binnenkort — vergeet niet te voorspellen!`;
    function tickDeadline() {
      const d2 = kwal - new Date();
      if (d2 <= 0) { banner.classList.remove('zichtbaar'); return; }
      const hh = Math.floor(d2 / 3600000);
      const mm = Math.floor((d2 % 3600000) / 60000);
      const ss = Math.floor((d2 % 60000) / 1000);
      document.getElementById('deadline-countdown').textContent =
        `${hh}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    }
    tickDeadline();
    setInterval(tickDeadline, 1000);
  }
}

// ── Banner animatie ───────────────────────────────────────────

function animeerKart() {
  const huidig = stand()[0];
  const el = document.getElementById('car');
  const leader = document.getElementById('leader-naam');
  if (leader && huidig) leader.textContent = '🏎️  ' + kortNaam(huidig.naam);
  el.style.animation = 'none';
  void el.offsetWidth;
  const breedte = Math.min(window.innerWidth, 960);
  const style = document.getElementById('kart-keyframe') || document.createElement('style');
  style.id = 'kart-keyframe';
  style.textContent = `@keyframes rijden {
    0%   { transform: translateX(-400px); }
    100% { transform: translateX(${breedte + 100}px); }
  }`;
  if (!document.getElementById('kart-keyframe')) document.head.appendChild(style);
  el.style.animation = 'rijden 18s linear infinite';
}

// ── Stat cards ────────────────────────────────────────────────

function vulStatCards() {
  const s = stand();
  const leider = s[0];
  document.getElementById('stat-leider').textContent = kortNaam(leider.naam);
  document.getElementById('stat-punten').textContent = leider.punten + ' pt';
  document.getElementById('stat-races').textContent = POULE_DATA.races.length;
  vulGrootsteStijger();
  vulAchtervolger();
}

function vulGrootsteStijger() {
  const n = POULE_DATA.races.length;
  if (n < 2) return;
  let beste = null, besteWinst = -Infinity;
  Object.entries(POULE_DATA.spelers).forEach(([naam, punten]) => {
    const winst = punten[n - 1] - punten[n - 2];
    if (winst > besteWinst) { besteWinst = winst; beste = naam; }
  });
  document.getElementById('stat-stijger').textContent = kortNaam(beste);
  document.getElementById('stat-stijger-sub').textContent =
    `+${besteWinst} pt in ${POULE_DATA.races[n - 1]}`;
}

function vulAchtervolger() {
  const s = stand();
  const n = POULE_DATA.races.length;
  if (s.length < 2 || n < 2) return;
  const leiderPunten = s[0].punten;
  let beste = null, besteScore = -Infinity;
  s.slice(1).forEach(({ naam, punten }) => {
    const reeks = POULE_DATA.spelers[naam];
    const inhaal = (reeks[n - 1] - reeks[n - 2]) - (POULE_DATA.spelers[s[0].naam][n - 1] - POULE_DATA.spelers[s[0].naam][n - 2]);
    const gap = leiderPunten - punten;
    const score = inhaal - gap * 0.3;
    if (score > besteScore) { besteScore = score; beste = naam; }
  });
  const gap = leiderPunten - POULE_DATA.spelers[beste][n - 1];
  document.getElementById('stat-achtervolger').textContent = kortNaam(beste);
  document.getElementById('stat-achtervolger-sub').textContent = `${gap} pt achter op ${kortNaam(s[0].naam)}`;
}

// ── Podium ────────────────────────────────────────────────────

function vulPodium() {
  const s = stand();
  const [p1, p2, p3] = s;
  const volgorde = [p2, p1, p3];
  const klassen = ['podium-2','podium-1','podium-3'];
  const emojis = ['🥈','🥇','🥉'];
  document.getElementById('podium').innerHTML = volgorde.map((p, i) => `
    <div class="podium-item ${klassen[i]}">
      <div class="podium-naam">${kortNaam(p.naam)}</div>
      <div class="podium-punten">${p.punten} pt</div>
      <div class="podium-blok">${emojis[i]}</div>
    </div>`).join('');
}

// ── Klassement tabel + kaartjes ───────────────────────────────

function vulStand() {
  const s = stand();
  const leider = s[0].punten;
  const n = POULE_DATA.races.length;

  document.getElementById('standings-body').innerHTML = s.map((sp, i) => {
    const laaste = n > 0 ? puntenPerRace(sp.naam)[n - 1] : 0;
    const gap = i === 0 ? '—' : '-' + (leider - sp.punten);
    const rij = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const medaille = i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : '';
    return `<tr class="${rij}">
      <td class="pos">${i + 1}</td>
      <td class="naam" onclick="openSpelerModal('${sp.naam.replace(/'/g,"\\'")}')">
        ${medaille}${kortNaam(sp.naam)}
      </td>
      <td class="pts">${sp.punten}</td>
      <td class="gap">${gap}</td>
      <td class="laaste" style="color:${laaste > 0 ? '#7CC576' : 'rgba(255,255,255,0.35)'}">
        ${laaste > 0 ? '+' + laaste : '—'}
      </td>
    </tr>`;
  }).join('');

  document.getElementById('speler-kaarten').innerHTML = s.map((sp, i) => {
    const laaste = n > 0 ? puntenPerRace(sp.naam)[n - 1] : 0;
    const kleur = kleurVoor(sp.naam);
    const pct = Math.round(sp.punten / leider * 100);
    const medaille = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
    const gap = i === 0 ? '' : `<span class="sk-gap">-${leider - sp.punten}</span>`;
    return `<div class="speler-kaart" style="--kleur:${kleur}" onclick="openSpelerModal('${sp.naam.replace(/'/g,"\\'")}')">
      <div class="sk-top">
        <div class="sk-plek">${medaille}</div>
        <div class="sk-naam">${kortNaam(sp.naam)}</div>
        <div class="sk-pts">${sp.punten}</div>
      </div>
      <div class="sk-bottom">
        <div class="sk-bar-wrap"><div class="sk-bar" style="width:${pct}%"></div></div>
        ${laaste > 0 ? `<span class="sk-laaste">+${laaste}</span>` : ''}
        ${gap}
      </div>
    </div>`;
  }).join('');
}

// ── Grafiek ───────────────────────────────────────────────────

let grafiekGemaakt = false;
let grafiekInstantie = null;
const actieveSpelers = new Set(Object.keys(POULE_DATA.spelers));

function maakGrafiek() {
  grafiekGemaakt = true;
  const canvas = document.getElementById('poulechart');
  const wrap = canvas.parentElement;
  if (window.innerWidth <= 600) {
    wrap.style.width = '700px';
    canvas.style.width = '700px';
  }
  const namen = Object.keys(POULE_DATA.spelers);
  grafiekInstantie = new Chart(canvas, {
    type: 'line',
    data: {
      labels: POULE_DATA.races,
      datasets: namen.map(naam => ({
        label: naam,
        data: POULE_DATA.spelers[naam],
        borderColor: kleurVoor(naam),
        backgroundColor: kleurVoor(naam) + '22',
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: false,
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${kortNaam(ctx.dataset.label)}: ${ctx.parsed.y} pt` } }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
      },
      onClick: (evt, elements) => {
        if (elements.length === 0) return;
        toonRaceDetail(elements[0].index);
      }
    }
  });
  vulLegend(namen);
}

function vulLegend(namen) {
  document.getElementById('legend').innerHTML = namen.map(naam => {
    const kleur = kleurVoor(naam);
    return `<div class="legend-item actief" data-naam="${naam}" onclick="toggleSpeler('${naam.replace(/'/g,"\\'")}')">
      <span class="dot" style="background:${kleur}"></span>${kortNaam(naam)}
    </div>`;
  }).join('');
}

function toggleSpeler(naam) {
  actieveSpelers.has(naam) ? actieveSpelers.delete(naam) : actieveSpelers.add(naam);
  grafiekInstantie.data.datasets.forEach(ds => { ds.hidden = !actieveSpelers.has(ds.label); });
  grafiekInstantie.update();
  document.querySelectorAll('.legend-item').forEach(el => {
    const actief = actieveSpelers.has(el.dataset.naam);
    el.classList.toggle('actief', actief);
    el.classList.toggle('gedempt', !actief);
  });
}

function toonRaceDetail(raceIdx) {
  const racenaam = POULE_DATA.races[raceIdx];
  const uitslagen = Object.entries(POULE_DATA.spelers).map(([naam, punten]) => ({
    naam, pts: raceIdx === 0 ? punten[0] : punten[raceIdx] - punten[raceIdx - 1]
  })).sort((a, b) => b.pts - a.pts);
  document.getElementById('race-detail-titel').textContent = `Uitslag: ${racenaam}`;
  document.getElementById('race-detail-grid').innerHTML = uitslagen.map((u, i) => `
    <div class="race-detail-item ${i === 0 ? 'top1' : ''}">
      <span class="rd-naam">${i === 0 ? '🏆 ' : ''}${kortNaam(u.naam)}</span>
      <span class="rd-pts">+${u.pts}</span>
    </div>`).join('');
  document.getElementById('race-detail').style.display = 'block';
}

// ── Seizoensoverzicht ─────────────────────────────────────────

function vulSeizoenOverzicht() {
  const n = POULE_DATA.races.length;
  const totaalRaces = 24;
  const s = stand();
  const namen = Object.keys(POULE_DATA.spelers);
  const gemPuntenPerRace = namen.reduce((acc, naam) => {
    return acc + POULE_DATA.spelers[naam][n - 1];
  }, 0) / namen.length / n;
  const resterend = totaalRaces - n;
  const hoogste = Math.max(...namen.map(naam => {
    const pp = puntenPerRace(naam);
    return Math.max(...pp);
  }));

  document.getElementById('seizoen-overzicht').innerHTML = `
    <div class="seizoen-stat"><div class="so-val">${n}</div><div class="so-lbl">Races gespeeld</div></div>
    <div class="seizoen-stat"><div class="so-val">${resterend}</div><div class="so-lbl">Races te gaan</div></div>
    <div class="seizoen-stat"><div class="so-val">${gemPuntenPerRace.toFixed(1)}</div><div class="so-lbl">Gem. pt/race poule</div></div>
    <div class="seizoen-stat"><div class="so-val">${hoogste}</div><div class="so-lbl">Beste losse race</div></div>`;
}

// ── Tijdlijn ──────────────────────────────────────────────────

function vulTijdlijn() {
  const gespeeld = POULE_DATA.races;
  const komend = KALENDER.map(k => k.naam);
  const alle = [...gespeeld, ...komend.filter(k => !gespeeld.includes(k))];
  const nu = new Date();
  const volgendeIdx = gespeeld.length; // eerste ongespeelde

  document.getElementById('tijdlijn').innerHTML = alle.map((naam, i) => {
    const gedaan = i < gespeeld.length;
    const huidig = i === volgendeIdx;
    const klasse = gedaan ? 'gedaan' : huidig ? 'huidig' : 'komend';
    const icon = gedaan ? '✓' : huidig ? '▶' : '';
    return `<div class="tijdlijn-race">
      <div class="tijdlijn-dot ${klasse}">${icon}</div>
      <div class="tijdlijn-naam ${klasse}">${naam}</div>
    </div>`;
  }).join('');
}

// ── Race reactie ──────────────────────────────────────────────

function vulReactie() {
  const n = POULE_DATA.races.length;
  if (n === 0) return;
  const s = stand();
  const { winnaarPerRace } = berekenStreaks();
  const laaste = POULE_DATA.races[n - 1];
  const winnaar = winnaarPerRace[n - 1];
  const winPunten = puntenPerRace(winnaar)[n - 1];

  // Wie verloor het meest?
  const namen = Object.keys(POULE_DATA.spelers);
  const [verliezer] = namen.map(naam => ({
    naam, pts: puntenPerRace(naam)[n - 1]
  })).sort((a, b) => a.pts - b.pts);

  const templates = [
    `🏁 <span>${kortNaam(winnaar)}</span> pakte de meeste punten in <span>${laaste}</span> met <span>${winPunten} pt</span>! ${kortNaam(verliezer.naam)} had een dagje om snel te vergeten (${verliezer.pts} pt 😬).`,
    `🔥 Wat een race in <span>${laaste}</span>! <span>${kortNaam(winnaar)}</span> gaat er vandoor met <span>${winPunten} pt</span>. De rest mag de schade opmaken.`,
    `🏎️ <span>${kortNaam(winnaar)}</span> domineert <span>${laaste}</span> met <span>${winPunten} pt</span>. <span>${kortNaam(s[0].naam)}</span> leidt het kampioenschap met ${s[0].punten} pt totaal.`,
    `💥 <span>${laaste}</span> is voorbij! <span>${kortNaam(winnaar)}</span> scoorde het meest (<span>${winPunten} pt</span>). Het klassement blijft spannend!`,
  ];
  const reactie = templates[n % templates.length];
  document.getElementById('reactie-wrap').innerHTML =
    `<div class="reactie-banner">${reactie}</div>`;
}

// ── Circuit specialisten ──────────────────────────────────────

function vulCircuitSpecialisten() {
  const namen = Object.keys(POULE_DATA.spelers);
  const rijen = POULE_DATA.races.map((race, i) => {
    let beste = null, bestePts = -1;
    namen.forEach(naam => {
      const p = i === 0 ? POULE_DATA.spelers[naam][0] : POULE_DATA.spelers[naam][i] - POULE_DATA.spelers[naam][i - 1];
      if (p > bestePts) { bestePts = p; beste = naam; }
    });
    const kleur = kleurVoor(beste);
    return `<tr>
      <td>${race}</td>
      <td class="ct-winnaar"><span class="ct-dot" style="background:${kleur}"></span>${kortNaam(beste)}</td>
      <td class="ct-pts">+${bestePts}</td>
    </tr>`;
  });
  document.getElementById('circuit-tbody').innerHTML = rijen.join('');
}

// ── Persoonlijk rapport ───────────────────────────────────────

function berekenRapport(naam) {
  const n = POULE_DATA.races.length;
  const s = stand();
  const plek = s.findIndex(sp => sp.naam === naam) + 1;
  const perRace = puntenPerRace(naam);
  const namen = Object.keys(POULE_DATA.spelers);

  // Consistentie (omgekeerde std, 0-100)
  const gem = perRace.reduce((a, b) => a + b, 0) / perRace.length;
  const std = Math.sqrt(perRace.reduce((a, b) => a + (b - gem) ** 2, 0) / perRace.length);
  const maxStd = 15;
  const consistentie = Math.max(0, Math.round((1 - std / maxStd) * 100));

  // Ranking (omgekeerde plek)
  const ranking = Math.round((1 - (plek - 1) / namen.length) * 100);

  // Pieken (beste race t.o.v. max mogelijke in de poule)
  const besteRace = Math.max(...perRace);
  const absoluteBeste = Math.max(...namen.flatMap(n2 => puntenPerRace(n2)));
  const pieken = Math.round(besteRace / absoluteBeste * 100);

  // Trend (zijn laatste 3 races beter dan de 3 daarvoor?)
  let trend = 50;
  if (n >= 6) {
    const recent = perRace.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const eerder = perRace.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    trend = eerder > 0 ? Math.min(100, Math.round(recent / eerder * 50)) : 50;
  }

  // Totaalscore → cijfer
  const totaal = Math.round(consistentie * 0.3 + ranking * 0.4 + pieken * 0.2 + trend * 0.1);
  let grade, kleur, tekst;
  if (totaal >= 85)      { grade = 'S'; kleur = '#FFD24A'; tekst = 'Absolute topklasse. De rest kijkt op je neer.'; }
  else if (totaal >= 70) { grade = 'A'; kleur = '#7CC576'; tekst = 'Uitstekend seizoen! Consistent en sterk.'; }
  else if (totaal >= 55) { grade = 'B'; kleur = '#5B9BD5'; tekst = 'Solide prestaties. Ruimte voor verbetering.'; }
  else if (totaal >= 40) { grade = 'C'; kleur = '#FF8A65'; tekst = 'Wisselvallig. Goede races, maar ook mindere.'; }
  else                   { grade = 'D'; kleur = '#E10600'; tekst = 'Een lastig seizoen. Volgende race beter!'; }

  return { grade, kleur, tekst, consistentie, ranking, pieken, trend };
}

// ── Stats tab ─────────────────────────────────────────────────

function vulStats() {
  vulReactie();
  vulStreak();
  vulDarkHorse();
  vulTrivia();
  vulPrognose();
  vulCircuitSpecialisten();
}

function berekenStreaks() {
  const n = POULE_DATA.races.length;
  const namen = Object.keys(POULE_DATA.spelers);
  const winnaarPerRace = POULE_DATA.races.map((_, i) => {
    let beste = null, besteP = -1;
    namen.forEach(naam => {
      const p = i === 0 ? POULE_DATA.spelers[naam][0] : POULE_DATA.spelers[naam][i] - POULE_DATA.spelers[naam][i - 1];
      if (p > besteP) { besteP = p; beste = naam; }
    });
    return beste;
  });
  const maxStreaks = {};
  namen.forEach(naam => {
    let cur = 0, max = 0;
    for (let i = 0; i < n; i++) {
      if (winnaarPerRace[i] === naam) { cur++; max = Math.max(max, cur); } else cur = 0;
    }
    maxStreaks[naam] = max;
  });
  // Huidige streak van de winnaar van de laatste race
  const huidigWinnaar = winnaarPerRace[n - 1];
  let huidigStreak = 0;
  for (let i = n - 1; i >= 0 && winnaarPerRace[i] === huidigWinnaar; i--) huidigStreak++;
  return { winnaarPerRace, maxStreaks, huidigWinnaar, huidigStreak };
}

function vulStreak() {
  const { huidigWinnaar, huidigStreak, maxStreaks } = berekenStreaks();
  const wrap = document.getElementById('streak-wrap');
  if (huidigStreak >= 2) {
    wrap.innerHTML = `<div class="streak-banner">
      <div class="streak-fire">🔥</div>
      <div class="streak-tekst">
        <h3>${kortNaam(huidigWinnaar)} is on fire!</h3>
        <p>${huidigStreak} races op rij gewonnen — niemand houdt hem/haar tegen!</p>
      </div>
    </div>`;
  } else {
    const [topNaam, topStreak] = Object.entries(maxStreaks).sort((a, b) => b[1] - a[1])[0];
    wrap.innerHTML = topStreak >= 2 ? `<div class="streak-banner">
      <div class="streak-fire">🏆</div>
      <div class="streak-tekst">
        <h3>Beste seizoen-streak: ${kortNaam(topNaam)}</h3>
        <p>${topStreak} races op rij gewonnen dit seizoen!</p>
      </div>
    </div>` : '';
  }
}

function vulDarkHorse() {
  const n = POULE_DATA.races.length;
  if (n < 2) return;
  const namen = Object.keys(POULE_DATA.spelers);
  let beste = null, besteOver = -Infinity;
  namen.forEach(naam => {
    const perRace = puntenPerRace(naam);
    const gem = perRace.slice(0, n - 1).reduce((a, b) => a + b, 0) / (n - 1);
    const over = perRace[n - 1] - gem;
    if (over > besteOver) { besteOver = over; beste = naam; }
  });
  document.getElementById('darkhorse-wrap').innerHTML = `<div class="darkhorse-kaart">
    <div class="darkhorse-icon">🐴</div>
    <div class="darkhorse-tekst">
      <h3>Dark horse: ${kortNaam(beste)}</h3>
      <p>Scoorde ${besteOver.toFixed(1)} pt boven zijn/haar gemiddelde in ${POULE_DATA.races[n - 1]}!</p>
    </div>
  </div>`;
}

function vulTrivia() {
  const namen = Object.keys(POULE_DATA.spelers);
  const n = POULE_DATA.races.length;
  const s = stand();
  const { winnaarPerRace } = berekenStreaks();
  const feiten = [];

  const winsPerSpeler = {};
  namen.forEach(naam => { winsPerSpeler[naam] = 0; });
  winnaarPerRace.forEach(w => { winsPerSpeler[w]++; });
  const [topW, topN] = Object.entries(winsPerSpeler).sort((a, b) => b[1] - a[1])[0];
  if (topN > 0) feiten.push(`<span>${kortNaam(topW)}</span> won de meeste races: <span>${topN}×</span> 🏆`);
  feiten.push(`De allereerste race (${POULE_DATA.races[0]}) werd gewonnen door <span>${kortNaam(winnaarPerRace[0])}</span>.`);
  feiten.push(`<span>${kortNaam(s[0].naam)}</span> leidt met <span>${s[0].punten - s[1].punten} pt</span> voorsprong op nummer 2.`);

  let slechtNaam = null, slechtPts = Infinity, slechtRace = '';
  namen.forEach(naam => {
    puntenPerRace(naam).forEach((p, i) => {
      if (p < slechtPts) { slechtPts = p; slechtNaam = naam; slechtRace = POULE_DATA.races[i]; }
    });
  });
  if (slechtNaam) feiten.push(`Slechtste race ooit: <span>${kortNaam(slechtNaam)}</span> scoorde <span>${slechtPts} pt</span> in ${slechtRace} 💀`);

  let consistentNaam = null, laagsteStd = Infinity;
  namen.forEach(naam => {
    const perRace = puntenPerRace(naam);
    const gem = perRace.reduce((a, b) => a + b, 0) / perRace.length;
    const std = Math.sqrt(perRace.reduce((a, b) => a + (b - gem) ** 2, 0) / perRace.length);
    if (std < laagsteStd) { laagsteStd = std; consistentNaam = naam; }
  });
  feiten.push(`<span>${kortNaam(consistentNaam)}</span> is de meest consistente speler dit seizoen.`);

  document.getElementById('trivia-lijst').innerHTML = feiten.map(f =>
    `<div class="trivia-item">💡 ${f}</div>`).join('');
}

function vulPrognose() {
  const n = POULE_DATA.races.length;
  const totaal = 24;
  const s = stand();
  const prognoses = s.map(sp => ({
    naam: sp.naam,
    huidig: sp.punten,
    prognose: Math.round((sp.punten / n) * totaal)
  })).sort((a, b) => b.prognose - a.prognose);
  const maxP = prognoses[0].prognose;
  document.getElementById('prognose-lijst').innerHTML = prognoses.map((p, i) => `
    <div class="prognose-rij">
      <span class="prognose-plek">${i + 1}</span>
      <span class="prognose-naam">${kortNaam(p.naam)}</span>
      <div class="prognose-bar-wrap"><div class="prognose-bar" style="width:${Math.round(p.prognose/maxP*100)}%;background:${kleurVoor(p.naam)}"></div></div>
      <span class="prognose-pts">${p.prognose}</span>
      <span class="prognose-huidig">(${p.huidig})</span>
    </div>`).join('');
}

// ── Head-to-head ─────────────────────────────────────────────

let h2hGemaakt = false;

function vulH2H() {
  const namen = Object.keys(POULE_DATA.spelers);
  const s1 = document.getElementById('h2h-speler1');
  const s2 = document.getElementById('h2h-speler2');
  if (!h2hGemaakt) {
    namen.forEach(naam => {
      [s1, s2].forEach(sel => {
        const o = document.createElement('option');
        o.value = naam; o.textContent = kortNaam(naam);
        sel.appendChild(o);
      });
    });
    s1.selectedIndex = 0;
    s2.selectedIndex = 1;
    s1.addEventListener('change', renderH2H);
    s2.addEventListener('change', renderH2H);
    h2hGemaakt = true;
  }
  renderH2H();
}

function renderH2H() {
  const naam1 = document.getElementById('h2h-speler1').value;
  const naam2 = document.getElementById('h2h-speler2').value;
  if (naam1 === naam2) {
    document.getElementById('h2h-resultaat').innerHTML = '<p style="color:rgba(255,255,255,0.4);text-align:center;padding:20px">Kies twee verschillende spelers</p>';
    return;
  }
  const k1 = kleurVoor(naam1), k2 = kleurVoor(naam2);
  const pp1 = puntenPerRace(naam1), pp2 = puntenPerRace(naam2);
  let wins1 = 0, wins2 = 0;
  POULE_DATA.races.forEach((_, i) => {
    if (pp1[i] > pp2[i]) wins1++;
    else if (pp2[i] > pp1[i]) wins2++;
  });
  const rijen = POULE_DATA.races.map((race, i) => {
    const p1 = pp1[i], p2 = pp2[i];
    const tot = p1 + p2 || 1;
    const w1 = Math.round(p1 / tot * 100), w2 = 100 - w1;
    const win1 = p1 > p2, win2 = p2 > p1;
    return `<div class="h2h-race-rij">
      <span class="h2h-race-naam">${race}</span>
      <span class="h2h-race-pts1" style="color:${win1 ? k1 : 'rgba(255,255,255,0.4)'}">${p1}</span>
      <div class="h2h-bar-wrap">
        <div class="h2h-bar1" style="width:${w1}%;background:${k1}${win1 ? '' : '55'}"></div>
        <div class="h2h-bar2" style="width:${w2}%;background:${k2}${win2 ? '' : '55'}"></div>
      </div>
      <span class="h2h-race-pts2" style="color:${win2 ? k2 : 'rgba(255,255,255,0.4)'}">${p2}</span>
    </div>`;
  }).join('');
  document.getElementById('h2h-resultaat').innerHTML = `
    <div class="h2h-score">
      <div class="h2h-naam-score">
        <div class="hs-naam" style="color:${k1}">${kortNaam(naam1)}</div>
        <div class="hs-wins" style="color:${k1}">${wins1}</div>
      </div>
      <span class="h2h-scheiding">—</span>
      <div class="h2h-naam-score">
        <div class="hs-naam" style="color:${k2}">${kortNaam(naam2)}</div>
        <div class="hs-wins" style="color:${k2}">${wins2}</div>
      </div>
    </div>
    <div class="h2h-races">${rijen}</div>`;
}

// ── Badges ────────────────────────────────────────────────────

function vulBadges() {
  const namen = Object.keys(POULE_DATA.spelers);
  const n = POULE_DATA.races.length;
  const s = stand();
  const { winnaarPerRace, maxStreaks } = berekenStreaks();
  const badges = [];

  // 👑 Leider
  badges.push({ emoji: '👑', naam: 'Leider', winnaar: s[0].naam, omschr: 'Staat momenteel bovenaan het klassement.' });

  // 🏆 Meeste race wins
  const wpp = {};
  namen.forEach(naam => { wpp[naam] = 0; });
  winnaarPerRace.forEach(w => { wpp[w]++; });
  const [topW, topN] = Object.entries(wpp).sort((a, b) => b[1] - a[1])[0];
  badges.push({ emoji: '🏆', naam: 'Race Koning/Koningin', winnaar: topW, omschr: `Won ${topN} van ${n} races dit seizoen.` });

  // ⚡ Sprint specialist
  const sprintIdx = POULE_DATA.races.map((r, i) => r.toLowerCase().includes('sprint') ? i : -1).filter(i => i >= 0);
  if (sprintIdx.length > 0) {
    let sprintKing = null, sprintGem = -Infinity;
    namen.forEach(naam => {
      const perRace = puntenPerRace(naam);
      const gem = sprintIdx.reduce((a, i) => a + perRace[i], 0) / sprintIdx.length;
      if (gem > sprintGem) { sprintGem = gem; sprintKing = naam; }
    });
    badges.push({ emoji: '⚡', naam: 'Sprint Killer', winnaar: sprintKing, omschr: `Beste gemiddelde op sprint races (${sprintGem.toFixed(1)} pt/race).` });
  }

  // 📈 Beste losse race
  let comebackNaam = null, comebackPts = -Infinity, comebackRace = '';
  namen.forEach(naam => {
    puntenPerRace(naam).forEach((p, i) => {
      if (p > comebackPts) { comebackPts = p; comebackNaam = naam; comebackRace = POULE_DATA.races[i]; }
    });
  });
  badges.push({ emoji: '📈', naam: 'Race MVP', winnaar: comebackNaam, omschr: `Beste race ooit: ${comebackPts} pt in ${comebackRace}.` });

  // 💀 Zwarte dag
  let slechtNaam = null, slechtPts = Infinity, slechtRace = '';
  namen.forEach(naam => {
    puntenPerRace(naam).forEach((p, i) => {
      if (p < slechtPts) { slechtPts = p; slechtNaam = naam; slechtRace = POULE_DATA.races[i]; }
    });
  });
  badges.push({ emoji: '💀', naam: 'Zwarte Dag', winnaar: slechtNaam, omschr: `Slechtste race: slechts ${slechtPts} pt in ${slechtRace}. Oeps!` });

  // 🔥 Langste streak
  const [streakNaam, streakN] = Object.entries(maxStreaks).sort((a, b) => b[1] - a[1])[0];
  badges.push({ emoji: '🔥', naam: 'On Fire', winnaar: streakNaam, omschr: `Langste race-streak: ${streakN} races op rij gewonnen.` });

  // 🎯 Consistent
  let consistentNaam = null, laagsteStd = Infinity;
  namen.forEach(naam => {
    const perRace = puntenPerRace(naam);
    const gem = perRace.reduce((a, b) => a + b, 0) / perRace.length;
    const std = Math.sqrt(perRace.reduce((a, b) => a + (b - gem) ** 2, 0) / perRace.length);
    if (std < laagsteStd) { laagsteStd = std; consistentNaam = naam; }
  });
  badges.push({ emoji: '🎯', naam: 'Metronoom', winnaar: consistentNaam, omschr: 'Meest consistente scores — altijd solide, nooit instorten.' });

  // 🚀 Raketstart
  let startNaam = null, startPts = -Infinity;
  namen.forEach(naam => {
    const p = POULE_DATA.spelers[naam][0];
    if (p > startPts) { startPts = p; startNaam = naam; }
  });
  badges.push({ emoji: '🚀', naam: 'Raketstart', winnaar: startNaam, omschr: `Won de allereerste race (${POULE_DATA.races[0]}) met ${startPts} pt.` });

  // 📊 Beste prognose
  const prognoseTopNaam = namen.map(naam => ({
    naam, prognose: Math.round((POULE_DATA.spelers[naam][n - 1] / n) * 24)
  })).sort((a, b) => b.prognose - a.prognose)[0];
  badges.push({ emoji: '📊', naam: 'Toekomstig Kampioen', winnaar: prognoseTopNaam.naam, omschr: `Beste seizoenprognose: ~${prognoseTopNaam.prognose} pt bij 24 races.` });

  document.getElementById('badges-grid').innerHTML = badges.map(b => `
    <div class="badge-kaart">
      <div class="badge-emoji">${b.emoji}</div>
      <div class="badge-naam">${b.naam}</div>
      <div class="badge-winnaar">${kortNaam(b.winnaar)}</div>
      <div class="badge-omschr">${b.omschr}</div>
    </div>`).join('');
}

// ── Speler modal ──────────────────────────────────────────────

function openSpelerModal(naam) {
  const s = stand();
  const plek = s.findIndex(sp => sp.naam === naam) + 1;
  const reeks = POULE_DATA.spelers[naam];
  const perRace = puntenPerRace(naam);
  const kleur = kleurVoor(naam);
  const totaal = reeks[reeks.length - 1];
  const beste = Math.max(...perRace);
  const gem = (perRace.reduce((a, b) => a + b, 0) / perRace.length).toFixed(1);
  const maxPts = Math.max(...perRace);

  document.getElementById('modal-naam').textContent = kortNaam(naam);
  document.getElementById('modal-rang').textContent = `#${plek} in het klassement`;
  document.getElementById('modal-totaal').textContent = totaal;
  document.getElementById('modal-beste').textContent = beste;
  document.getElementById('modal-gem').textContent = gem;
  const rapport = berekenRapport(naam);
  document.getElementById('modal-rapport').innerHTML = `
    <div class="rapport-label">Seizoensrapport</div>
    <div class="rapport-score">
      <div class="rapport-grade" style="color:${rapport.kleur}">${rapport.grade}</div>
      <div class="rapport-tekst">${rapport.tekst}</div>
    </div>
    <div class="rapport-bars">
      <div class="rapport-row"><span class="rapport-row-label">Ranking</span><div class="rapport-row-bar-wrap"><div class="rapport-row-bar" style="width:${rapport.ranking}%;background:#FFD24A"></div></div><span class="rapport-row-val">${rapport.ranking}</span></div>
      <div class="rapport-row"><span class="rapport-row-label">Consistentie</span><div class="rapport-row-bar-wrap"><div class="rapport-row-bar" style="width:${rapport.consistentie}%;background:#7CC576"></div></div><span class="rapport-row-val">${rapport.consistentie}</span></div>
      <div class="rapport-row"><span class="rapport-row-label">Pieken</span><div class="rapport-row-bar-wrap"><div class="rapport-row-bar" style="width:${rapport.pieken}%;background:#5B9BD5"></div></div><span class="rapport-row-val">${rapport.pieken}</span></div>
      <div class="rapport-row"><span class="rapport-row-label">Trend</span><div class="rapport-row-bar-wrap"><div class="rapport-row-bar" style="width:${rapport.trend}%;background:#FF8A65"></div></div><span class="rapport-row-val">${rapport.trend}</span></div>
    </div>`;

  document.getElementById('modal-races').innerHTML = POULE_DATA.races.map((race, i) => `
    <div class="modal-race-row">
      <span class="modal-race-naam">${race}</span>
      <div class="modal-race-bar-wrap">
        <div class="modal-race-bar" style="width:${Math.round(perRace[i]/maxPts*100)}%;background:${kleur}"></div>
      </div>
      <span class="modal-race-pts">+${perRace[i]}</span>
    </div>`).join('');
  document.getElementById('speler-modal').classList.add('open');
}

document.getElementById('modal-sluit').addEventListener('click', () => {
  document.getElementById('speler-modal').classList.remove('open');
});
document.getElementById('speler-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

// ── Confetti ──────────────────────────────────────────────────

function vuurConfetti() {
  if (typeof confetti === 'undefined') return;
  const kleuren = ['#E10600','#FFD24A','#fff'];
  confetti({ particleCount: 100, spread: 80, origin: { y: 0.4 }, colors: kleuren });
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 }, colors: kleuren }), 500);
}

// ── Init ──────────────────────────────────────────────────────

function init() {
  startCountdown();
  checkDeadlineBanner();
  vulSeizoenOverzicht();
  vulStatCards();
  vulPodium();
  vulStand();
  vulTijdlijn();
  vulStats();
  vulBadges();
  animeerKart();
  setTimeout(vuurConfetti, 800);
}

init();
