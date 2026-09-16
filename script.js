// Theme Controller
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-icon");
const currentTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", currentTheme);
themeIcon.textContent = currentTheme === "dark" ? "☀️" : "🌙";

themeToggle.addEventListener("click", () => {
  const activeTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = activeTheme === "light" ? "dark" : "light";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  themeIcon.textContent = newTheme === "dark" ? "☀️" : "🌙";
});

// Data Model
let state = {
  name: "",
  teamCount: 0,
  teams: [],
  matches: {}
};

// Dynamic Team Inputs Handler
const teamCountInput = document.getElementById("team-count");
const teamInputsContainer = document.getElementById("team-inputs-container");

teamCountInput.addEventListener("change", () => {
  const count = parseInt(teamCountInput.value);
  teamInputsContainer.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Команда ${i + 1}`;
    input.classList.add("team-input");
    teamInputsContainer.appendChild(input);
  }
});

// Bracket Generator
function generateBracket(teams) {
  const rounds = Math.log2(teams.length);
  const matches = {};

  for (let round = 1; round <= rounds; round++) {
    matches[round] = [];
    const matchCount = teams.length / Math.pow(2, round);

    for (let i = 0; i < matchCount; i++) {
      if (round === 1) {
        matches[round].push({
          team1: teams[i * 2],
          team2: teams[i * 2 + 1],
          winner: null
        });
      } else {
        matches[round].push({ team1: "TBD", team2: "TBD", winner: null });
      }
    }
  }

  return matches;
}

function renderBracket(matches) {
  const bracketContainer = document.getElementById("bracket-container");
  const titleDisplay = document.getElementById("display-tournament-title");
  
  if (state.name) {
    titleDisplay.textContent = `Сетка турнира: ${state.name}`;
  }

  bracketContainer.innerHTML = "";

  Object.keys(matches).forEach((round) => {
    const roundDiv = document.createElement("div");
    roundDiv.classList.add("round");
    
    const roundTitle = document.createElement("div");
    roundTitle.classList.add("round-title");
    roundTitle.textContent = `Раунд ${round}`;
    roundDiv.appendChild(roundTitle);

    matches[round].forEach((match, index) => {
      const matchCard = document.createElement("div");
      matchCard.classList.add("match-card");

      const isWinner1 = match.winner && match.winner === match.team1;
      const isWinner2 = match.winner && match.winner === match.team2;

      matchCard.innerHTML = `
        <div class="team ${isWinner1 ? 'winner' : ''}" data-team="1">${match.team1 || "TBD"}</div>
        <div class="team ${isWinner2 ? 'winner' : ''}" data-team="2">${match.team2 || "TBD"}</div>
      `;

      matchCard.querySelectorAll(".team").forEach((teamEl) => {
        teamEl.addEventListener("click", (e) => handleMatchClick(e, round, index));
      });

      roundDiv.appendChild(matchCard);
    });

    bracketContainer.appendChild(roundDiv);
  });
}

// Winner Announcement Modal
function showWinnerModal(winnerName) {
  const modal = document.getElementById("winner-modal");
  const winnerMessage = document.getElementById("winner-message");
  const closeModal = document.getElementById("close-modal");

  winnerMessage.textContent = `🏆 Победитель турнира: ${winnerName}!`;
  modal.classList.remove("hidden");

  closeModal.onclick = () => {
    modal.classList.add("hidden");
  };
}

// Interactive System
function handleMatchClick(event, round, matchIndex) {
  const match = state.matches[round][matchIndex];
  const selectedTeamNum = event.target.dataset.team;
  const selectedTeamName = match[`team${selectedTeamNum}`];

  if (selectedTeamName && selectedTeamName !== "TBD") {
    match.winner = selectedTeamName;
    advanceWinner(round, matchIndex, selectedTeamName);
    saveState();
    renderBracket(state.matches);
  }
}

function advanceWinner(round, matchIndex, winner) {
  const nextRound = parseInt(round) + 1;
  const nextMatchIndex = Math.floor(matchIndex / 2);

  if (!state.matches[nextRound]) {
    showWinnerModal(winner);
    return;
  }

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
    state = JSON.parse(savedState);
    if (state.matches && Object.keys(state.matches).length > 0) {
      renderBracket(state.matches);
    }
  }
}

// Event Listeners
document.getElementById("generate-bracket").addEventListener("click", () => {
  const nameInput = document.getElementById("tournament-name");
  const teamInputs = document.querySelectorAll(".team-input");

  if (!nameInput.value || !teamCountInput.value) {
    alert("Заполните название и выберите количество команд!");
    return;
  }

  state.name = nameInput.value;
  state.teamCount = parseInt(teamCountInput.value);
  
  // Collect custom names or default to "Команда X"
  state.teams = Array.from(teamInputs).map((input, i) => input.value.trim() || `Команда ${i + 1}`);
  
  // Fallback if inputs weren't rendered yet
  if (state.teams.length === 0) {
    state.teams = Array.from({ length: state.teamCount }, (_, i) => `Команда ${i + 1}`);
  }

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