const BEER_PRICE = 12;

const state = {
  dave: 0,
  mullen: 0,
  sessionStart: Date.now(),
};

const drunkLevels = [
  { min: 0,  max: 0,  status: "Stone Cold Sober 😒",          meterPct: 0   },
  { min: 1,  max: 1,  status: "Just Warming Up 🥱",            meterPct: 8   },
  { min: 2,  max: 2,  status: "Feeling It a Bit 🙂",           meterPct: 16  },
  { min: 3,  max: 3,  status: "Getting Chatty 😏",             meterPct: 25  },
  { min: 4,  max: 4,  status: "Proper Craic 😄",               meterPct: 35  },
  { min: 5,  max: 5,  status: "Telling Great Stories 🗣",       meterPct: 45  },
  { min: 6,  max: 6,  status: "Loves Everyone 🥰",             meterPct: 55  },
  { min: 7,  max: 7,  status: "Where Are We Again? 😵",        meterPct: 65  },
  { min: 8,  max: 8,  status: "Speaking in Tongues 🤪",        meterPct: 75  },
  { min: 9,  max: 9,  status: "Calling Your Ex 😬",            meterPct: 82  },
  { min: 10, max: 11, status: "Legendary Status 🔥",           meterPct: 90  },
  { min: 12, max: 14, status: "Pure Mangled 💀",               meterPct: 96  },
  { min: 15, max: 999,status: "Clinically Dissolved ☠",        meterPct: 100 },
];

const funFacts = [
  '"A pint of Guinness has fewer calories than a pint of orange juice. You\'re basically on a diet."',
  '"Guinness is brewed with nitrogen, not CO2 — that\'s why it\'s smoother than your chat-up lines."',
  '"It takes exactly 119.5 seconds to pour the perfect pint. Dave takes 119.5 seconds to decide he wants one."',
  '"Arthur Guinness signed a 9,000-year lease on his brewery. Absolute commitment. Take notes, lads."',
  '"The perfect Guinness is served at 6°C (42.8°F). Cold as Mullen\'s heart after a bad session."',
  '"Guinness accounts for 2.5% of all beer sold worldwide. The lads account for 2.5% of that."',
  '"There are 10.8 million pints of Guinness consumed every day. You lads are doing your bit."',
  '"Guinness was once prescribed by doctors to post-operative patients. Healthcare was class back then."',
];

const announcements = {
  0:  "The session has begun. May the pints flow and the dignity slowly evaporate. 🍺",
  1:  "First pint down. A journey of a thousand miles begins with a single Guinness.",
  2:  "Two pints in. Officially off the clock. Arthur Guinness would be proud.",
  3:  "Three pints. You're not drunk, you're just aggressively relaxed.",
  4:  "Four pints! The craic is approaching. Hide your phone.",
  5:  "FIVE PINTS. Half a ten-pack. The night is young and so are your terrible decisions.",
  6:  "Six pints in! At this point you're basically Guinness-powered. 🔥",
  7:  "SEVEN! Dave's coat rack is now a hat stand. Mullen has opinions about everything.",
  8:  "Eight pints. You're not slurring, you're speaking in a richer dialect.",
  9:  "NINE PINTS. Medical science would like a word with both of you.",
  10: "TEN PINTS. LEGENDARY. Arthur Guinness has appeared in your peripheral vision.",
};

const gpTaunts = [
  "is the reigning GP champion 🏆 (Giant Pussy Award)",
  "is nursing that pint like it owes them money 🐱",
  "is taking it easy... AKA being a complete softie 😂",
  "is clearly saving room for dessert 🍰",
  "has been sipping like it's a fine wine. Mate, it's a Guinness. 😤",
  "is giving 'I've got work tomorrow' energy 📋",
];

let factIndex = Math.floor(Math.random() * funFacts.length);
let sessionTimerInterval = null;

function init() {
  loadState();
  render();
  startSessionTimer();
  rotateFunFacts();
}

function loadState() {
  const saved = localStorage.getItem('beerTrackerState');
  if (saved) {
    const parsed = JSON.parse(saved);
    state.dave = parsed.dave || 0;
    state.mullen = parsed.mullen || 0;
    state.sessionStart = parsed.sessionStart || Date.now();
  }
}

function saveState() {
  localStorage.setItem('beerTrackerState', JSON.stringify(state));
}

function addBeer(person) {
  state[person]++;
  saveState();
  render();
  triggerBurst();
  showAnnouncement(person);
  flashCard(person);
}

function removeBeer(person) {
  if (state[person] > 0) {
    state[person]--;
    saveState();
    render();
  }
}

function render() {
  const dave = state.dave;
  const mullen = state.mullen;
  const total = dave + mullen;

  // Counts
  document.getElementById('count-dave').textContent = dave;
  document.getElementById('count-mullen').textContent = mullen;
  document.getElementById('total-beers-counter').textContent = `Total Pints Destroyed: ${total}`;

  // Scoreboard
  document.getElementById('sb-dave-count').textContent = dave;
  document.getElementById('sb-mullen-count').textContent = mullen;
  document.getElementById('sb-dave-spend').textContent = `$${dave * BEER_PRICE}`;
  document.getElementById('sb-mullen-spend').textContent = `$${mullen * BEER_PRICE}`;

  // Spend
  document.getElementById('spend-dave').textContent = `$${dave * BEER_PRICE}`;
  document.getElementById('spend-mullen').textContent = `$${mullen * BEER_PRICE}`;

  // Drunk status & meter
  updateDrunkStatus('dave', dave);
  updateDrunkStatus('mullen', mullen);

  // Glass fill
  updateGlass('dave', dave);
  updateGlass('mullen', mullen);

  // GP Award
  updateGPAward(dave, mullen);

  // Card glow
  updateCardGlow(dave, mullen);
}

function getDrunkLevel(count) {
  return drunkLevels.find(l => count >= l.min && count <= l.max) || drunkLevels[drunkLevels.length - 1];
}

function updateDrunkStatus(person, count) {
  const level = getDrunkLevel(count);
  const meter = document.getElementById(`meter-${person}`);
  const status = document.getElementById(`status-${person}`);
  meter.style.width = level.meterPct + '%';
  status.textContent = level.status;
}

function updateGlass(person, count) {
  const fill = document.getElementById(`fill-${person}`);
  const foam = fill.parentElement.querySelector('.foam');
  const pct = Math.min(count * 7, 85);
  fill.style.height = pct + '%';
  foam.style.opacity = count > 0 ? '1' : '0';
}

function updateGPAward(dave, mullen) {
  const gpSection = document.getElementById('gp-section');
  const gpWinner = document.getElementById('gp-winner');
  const daveBadge = document.getElementById('award-dave');
  const mullenBadge = document.getElementById('award-mullen');

  daveBadge.textContent = '';
  mullenBadge.textContent = '';
  daveBadge.className = 'award-badge';
  mullenBadge.className = 'award-badge';

  if (dave === 0 && mullen === 0) {
    gpWinner.textContent = "Start drinking to find out...";
    return;
  }

  if (dave === mullen) {
    gpWinner.textContent = "Tied! You're both equally pathetic. 🤝";
    return;
  }

  const taunt = gpTaunts[Math.floor(Math.random() * gpTaunts.length)];

  if (dave < mullen) {
    gpWinner.textContent = `Dave "Coat Rack" ${taunt}`;
    daveBadge.textContent = 'GP 🐱';
    daveBadge.className = 'award-badge gp';
    mullenBadge.textContent = '🏆 CHAMP';
    mullenBadge.className = 'award-badge champ';
  } else {
    gpWinner.textContent = `Mullen ${taunt}`;
    mullenBadge.textContent = 'GP 🐱';
    mullenBadge.className = 'award-badge gp';
    daveBadge.textContent = '🏆 CHAMP';
    daveBadge.className = 'award-badge champ';
  }
}

function updateCardGlow(dave, mullen) {
  const daveCard = document.getElementById('card-dave');
  const mullenCard = document.getElementById('card-mullen');

  daveCard.className = 'drinker-card';
  mullenCard.className = 'drinker-card';

  if (dave === 0 && mullen === 0) return;
  if (dave === mullen) return;

  if (dave > mullen) {
    daveCard.className = 'drinker-card winning';
    mullenCard.className = 'drinker-card losing';
  } else {
    mullenCard.className = 'drinker-card winning';
    daveCard.className = 'drinker-card losing';
  }
}

function showAnnouncement(person) {
  const total = state.dave + state.mullen;
  const personCount = state[person];
  const name = person === 'dave' ? 'Dave "Coat Rack"' : 'Mullen';
  const bar = document.getElementById('announcement');

  let msg = announcements[personCount]
    ? `${name} — ${announcements[personCount]}`
    : `${name} just sank pint #${personCount}. The legend grows. 🍺`;

  bar.textContent = msg;
  bar.style.opacity = '1';
}

function flashCard(person) {
  const card = document.getElementById(`card-${person}`);
  card.style.transition = 'box-shadow 0.1s';
  card.style.boxShadow = '0 0 30px rgba(200, 146, 42, 0.8)';
  setTimeout(() => {
    card.style.boxShadow = '';
    card.style.transition = '';
  }, 400);
}

function triggerBurst() {
  const burst = document.createElement('div');
  burst.className = 'burst';
  burst.textContent = ['🍺', '🍻', '🏆', '💥'][Math.floor(Math.random() * 4)];
  burst.style.left = (20 + Math.random() * 60) + 'vw';
  burst.style.top = (20 + Math.random() * 60) + 'vh';
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 900);
}

function startSessionTimer() {
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);
  sessionTimerInterval = setInterval(() => {
    const elapsed = Date.now() - state.sessionStart;
    const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('session-time').textContent = `Session Time: ${h}:${m}:${s}`;
  }, 1000);
}

function rotateFunFacts() {
  setInterval(() => {
    factIndex = (factIndex + 1) % funFacts.length;
    document.getElementById('fun-fact').textContent = funFacts[factIndex];
  }, 12000);
  document.getElementById('fun-fact').textContent = funFacts[factIndex];
}

function resetSession() {
  if (!confirm('Reset the whole session? This will zero out all pints. Are you sure, you absolute animal?')) return;
  state.dave = 0;
  state.mullen = 0;
  state.sessionStart = Date.now();
  saveState();
  render();
  document.getElementById('announcement').textContent = 'New session started. May God have mercy on your livers.';
}

// Kick everything off
init();
