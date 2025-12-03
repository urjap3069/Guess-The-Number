let secretNumber;
let maxRange;
let message = document.getElementById("message");
let inputBox = document.getElementById("userInput");
let checkBtn = document.getElementById("checkBtn");
let currentLevel = document.getElementById("currentLevel");

// LEVEL BUTTONS
document.getElementById("easy").addEventListener("click", () => startGame(10, "Easy"));
document.getElementById("medium").addEventListener("click", () => startGame(50, "Medium"));
document.getElementById("hard").addEventListener("click", () => startGame(100, "Hard"));

// GAME START FUNCTION
function startGame(range, levelName) {
    maxRange = range;
    secretNumber = Math.floor(Math.random() * maxRange) + 1;

    currentLevel.textContent = `Level: ${levelName} (1 - ${maxRange})`;
    message.textContent = "Game started! Guess the number.";

    inputBox.disabled = false;
    checkBtn.disabled = false;

    inputBox.value = "";
    document.body.style.background = "#f5f5f5";
}

// CHECK BUTTON
checkBtn.addEventListener("click", function () {
    let guess = Number(inputBox.value);

    if (!guess) {
        message.textContent = "❌ Enter a valid number!";
    } 
    else if (guess < secretNumber) {
        message.textContent = "📉 Too low!";
    } 
    else if (guess > secretNumber) {
        message.textContent = "📈 Too high!";
    } 
    else {
        message.textContent = "🎉 Correct! You Win!";
        document.body.style.background = "#90ee90";
    }
});

// RESET BUTTON
document.getElementById("resetBtn").addEventListener("click", function () {
    inputBox.value = "";
    message.textContent = "Select a level to start.";
    currentLevel.textContent = "Level: Not Selected";
    inputBox.disabled = true;
    checkBtn.disabled = true;
    document.body.style.background = "#f5f5f5";
});
