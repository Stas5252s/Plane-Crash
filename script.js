let balance = 1000;
let bet = 10;
let multiplier = 1.0;
let isPlaying = false;
let hasActiveBet = false;
let crashPoint = null;
let hasCrashed = false;
let cashedOut = false;
let history = [];
let intervalId = null;
let startTime = null;

// DOM Elements
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("betInput");
const multiplierEl = document.getElementById("multiplier");
const multiplierBox = document.getElementById("multiplierBox");
const potentialWinEl = document.getElementById("potentialWin");
const messageEl = document.getElementById("message");
const betBtn = document.getElementById("betBtn");
const cashoutBtn = document.getElementById("cashoutBtn");
const historyCard = document.getElementById("historyCard");
const historyGrid = document.getElementById("historyGrid");

// Generate crash point
function generateCrashPoint() {
  const e = Math.random();
  const crashPoint = Math.floor((100 / (1 - e) / 100) * 100) / 100;
  return Math.max(1.0, Math.min(crashPoint, 100));
}

// Update UI
function updateUI() {
  balanceEl.textContent = `$${balance.toFixed(2)}`;
  multiplierEl.textContent = `${multiplier.toFixed(2)}x`;
  potentialWinEl.textContent = `$${(bet * multiplier).toFixed(2)}`;

  // Update multiplier color
  multiplierEl.classList.remove("crashed", "cashed-out");
  multiplierBox.classList.remove("crashed", "cashed-out", "playing");

  if (hasCrashed) {
    multiplierEl.classList.add("crashed");
    multiplierBox.classList.add("crashed");
  } else if (cashedOut) {
    multiplierEl.classList.add("cashed-out");
    multiplierBox.classList.add("cashed-out");
  } else if (isPlaying) {
    multiplierBox.classList.add("playing");
  }
}

// Show message
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `message show ${type}`;
}

// Hide message
function hideMessage() {
  messageEl.classList.remove("show");
}

// Add to history
function addToHistory(multiplierValue, isWin) {
  history.unshift({ multiplier: multiplierValue, isWin });
  if (history.length > 10) history.pop();

  updateHistoryUI();
}

// Update history UI
function updateHistoryUI() {
  if (history.length === 0) {
    historyCard.style.display = "none";
    return;
  }

  historyCard.style.display = "block";
  historyGrid.innerHTML = "";

  history.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = `history-item ${item.isWin ? "win" : "loss"}`;
    historyItem.textContent = `${item.multiplier}x`;
    historyGrid.appendChild(historyItem);
  });
}

// Start game
function startGame() {
  bet = parseFloat(betInput.value) || 10;

  if (bet > balance) {
    showMessage("Insufficient balance!", "error");
    return;
  }
  if (bet < 1) {
    showMessage("Minimum bet is $1", "error");
    return;
  }

  crashPoint = generateCrashPoint();
  isPlaying = true;
  hasActiveBet = true;
  hasCrashed = false;
  cashedOut = false;
  multiplier = 1.0;
  balance -= bet;

  hideMessage();
  updateUI();

  betBtn.disabled = true;
  cashoutBtn.disabled = false;
  betInput.disabled = true;
  betBtn.textContent = "Playing...";

  startTime = Date.now();

  intervalId = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const currentMultiplier = 1 + Math.pow(elapsed, 1.5) * 0.3;

    if (currentMultiplier >= crashPoint) {
      clearInterval(intervalId);
      multiplier = crashPoint;
      hasCrashed = true;
      isPlaying = false;
      hasActiveBet = false;

      updateUI();
      showMessage(
        `Crashed at ${crashPoint.toFixed(2)}x! You lost $${bet.toFixed(2)}`,
        "loss"
      );
      addToHistory(crashPoint.toFixed(2), false);

      betBtn.disabled = false;
      cashoutBtn.disabled = true;
      betInput.disabled = false;
      betBtn.textContent = "Place Bet";
    } else {
      multiplier = currentMultiplier;
      updateUI();
    }
  }, 50);
}

// Cash out
function cashOut() {
  if (!hasActiveBet || hasCrashed || cashedOut) return;

  clearInterval(intervalId);
  const winnings = bet * multiplier;
  balance += bet + winnings;
  cashedOut = true;
  isPlaying = false;
  hasActiveBet = false;

  updateUI();
  showMessage(
    `Cashed out at ${multiplier.toFixed(2)}x! Won $${winnings.toFixed(2)}`,
    "win"
  );
  addToHistory(multiplier.toFixed(2), true);

  betBtn.disabled = false;
  cashoutBtn.disabled = true;
  betInput.disabled = false;
  betBtn.textContent = "Place Bet";
}

// Event listeners
betBtn.addEventListener("click", startGame);
cashoutBtn.addEventListener("click", cashOut);
betInput.addEventListener("input", (e) => {
  bet = parseFloat(e.target.value) || 10;
  updateUI();
});

// Initialize
updateUI();
