// Dynamic Team Inputs
const teamCountInput = document.getElementById("team-count");
const teamInputsContainer = document.getElementById("team-inputs-container");

teamCountInput.addEventListener("change", () => {
  const teamCount = parseInt(teamCountInput.value);
  teamInputsContainer.innerHTML = "";

  for (let i = 0; i < teamCount; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Команда ${i + 1}`;
    input.classList.add("team-input");
    input.dataset.teamIndex = i;
    teamInputsContainer.appendChild(input);
  }
});

// Generate Bracket with Custom Team Names
document.getElementById("generate-bracket").addEventListener("click", () => {
  const nameInput = document.getElementById("tournament-name");
  const teamInputs = document.querySelectorAll(".team-input");

  if (!nameInput.value || !teamCountInput.value) {
    alert("Заполните название и выберите количество команд!");
    return;
  }

  state.name = nameInput.value;
  state.teamCount = parseInt(teamCountInput.value);
  state.teams = Array.from(teamInputs).map((input, i) => input.value.trim() || `Команда ${i + 1}`);
  state.matches = generateBracket(state.teams);

  saveState();
  renderBracket(state.matches);
});

// Grand Winner Announcement
function showWinnerModal(winnerName) {
  const modal = document.getElementById("winner-modal");
  const winnerMessage = document.getElementById("winner-message");
  const closeModal = document.getElementById("close-modal");

  winnerMessage.textContent = `🏆 Победитель турнира: ${winnerName}!`;
  modal.classList.add("active");

  closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
  });
}

function advanceWinner(round, matchIndex, winner) {
  const nextRound = parseInt(round) + 1;
  const nextMatchIndex = Math.floor(matchIndex / 2);

  if (!state.matches[nextRound]) {
    // Final match winner
    showWinnerModal(winner);
    return;
  }

  const nextMatch = state.matches[nextRound][nextMatchIndex];
  const teamPosition = matchIndex % 2 === 0 ? "team1" : "team2";

  nextMatch[teamPosition] = winner;
}