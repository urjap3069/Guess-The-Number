let secretNumber = Math.floor(Math.random() * 100) + 1;
let score = 10;
let highScore = localStorage.getItem("highScore") || 0;

document.getElementById("highScore").textContent = highScore;

const guessInput = document.getElementById("guess");
const message = document.getElementById("message");
const scoreDisplay = document.getElementById("score");

// Show message
function showMsg(msg) {
  message.textContent = msg;
}

// Check Guess
document.getElementById("checkBtn").addEventListener("click", function () {
  const guess = Number(guessInput.value);

  if (!guess || guess < 1 || guess > 100) {
    showMsg("⛔ Enter a valid number!");
    return;
  }

  if (guess === secretNumber) {
    showMsg("🎉 Correct Number!");
    document.body.style.background = "green";

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById("highScore").textContent = highScore;
    }
  } 
  else {
    score--;
    scoreDisplay.textContent = score;

    if (score <= 0) {
      showMsg("💥 Game Over!");
      document.body.style.background = "red";
    } 
    else if (guess > secretNumber) {
      showMsg("📈 Too High!");
    } 
    else {
      showMsg("📉 Too Low!");
    }
  }
});

// Reset Game
document.getElementById("resetBtn").addEventListener("click", function () {
  score = 10;
  secretNumber = Math.floor(Math.random() * 100) + 1;

  scoreDisplay.textContent = score;
  guessInput.value = "";
  showMsg("Start guessing...");
  document.body.style.background = "linear-gradient(135deg, #6a11cb, #2575fc)";
});
