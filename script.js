// Theme Controller
const themeToggle = document.getElementById("theme-toggle");
const currentTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", currentTheme);

themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
  const newTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
});

// Data Model
const state = {
  name: "",
  teamCount: 0,
  teams: [],
  matches: {}
};

// Bracket Generator
function generateBracket(teams) {
  const rounds = Math.log2(teams.length);
  const matches = {};

  for (let round = 1; round <= rounds; round++) {
    matches[round] = [];
    const matchCount = teams.length / Math.pow(2, round);

    for (let i = 0; i < matchCount; i++) {
      matches[round].push({ team1: null, team2: null, winner: null });
    }
  }

  return matches;
}

function renderBracket(matches) {
  const bracketContainer = document.getElementById("bracket-container");
  bracketContainer.innerHTML = "";

  Object.keys(matches).forEach((round) => {
    const roundDiv = document.createElement("div");
    roundDiv.classList.add("round");
    roundDiv.innerHTML = `<h3>Round ${round}</h3>`;

    matches[round].forEach((match, index) => {
      const matchCard = document.createElement("div");
      matchCard.classList.add("match-card");
      matchCard.dataset.round = round;
      matchCard.dataset.match = index;

      matchCard.innerHTML = `
        <div class="team" data-team="1">${match.team1 || "TBD"}</div>
        <div class="team" data-team="2">${match.team2 || "TBD"}</div>
      `;

      matchCard.addEventListener("click", (e) => handleMatchClick(e, round, index));
      roundDiv.appendChild(matchCard);
    });

    bracketContainer.appendChild(roundDiv);
  });
}

// Interactive System
function handleMatchClick(event, round, matchIndex) {
  const match = state.matches[round][matchIndex];
  const selectedTeam = event.target.dataset.team;

  if (selectedTeam && match[`team${selectedTeam}`]) {
    match.winner = match[`team${selectedTeam}`];
    advanceWinner(round, matchIndex, match.winner);
    saveState();
    renderBracket(state.matches);
  }
}

function advanceWinner(round, matchIndex, winner) {
  const nextRound = parseInt(round) + 1;
  const nextMatchIndex = Math.floor(matchIndex / 2);

  if (!state.matches[nextRound]) return;

  const nextMatch = state.matches[nextRound][nextMatchIndex];
  const teamPosition = matchIndex % 2 === 0 ? "team1" : "team2";

  nextMatch[teamPosition] = winner;
}

// Persistence Layer
function saveState() {
  localStorage.setItem("tournamentState", JSON.stringify(state));
}

function loadState() {
  const savedState = localStorage.getItem("tournamentState");
  if (savedState) {
    Object.assign(state, JSON.parse(savedState));
    renderBracket(state.matches);
  }
}

// Event Listeners
document.getElementById("generate-bracket").addEventListener("click", () => {
  const nameInput = document.getElementById("tournament-name");
  const teamCountInput = document.getElementById("team-count");

  state.name = nameInput.value;
  state.teamCount = parseInt(teamCountInput.value);
  state.teams = Array.from({ length: state.teamCount }, (_, i) => `Team ${i + 1}`);
  state.matches = generateBracket(state.teams);

  saveState();
  renderBracket(state.matches);
});

document.getElementById("reset-tournament").addEventListener("click", () => {
  localStorage.removeItem("tournamentState");
  location.reload();
});

// Initialize
loadState();