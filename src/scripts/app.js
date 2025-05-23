// scripts/app.js
document.getElementById("play-btn").addEventListener("click", () => {
  window.location.href = "play.html";
});

// Game State
let currentMode = null;
let currentCategory = 'Conocimiento General';
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timeLeft = 30;
let timer = null;
let questions = [];

// Theme Management
function toggleTheme() {
    document.body.classList.toggle('dark');
    const themeBtn = document.querySelector('.theme-toggle');
    themeBtn.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Game Modes
function startGame(mode) {
    currentMode = mode;
    
    if (mode === 'study') {
        currentCategory = 'Conocimiento General';
        startQuiz();
    } else if (mode === 'exam') {
        currentCategory = 'Programación';
        startQuiz();
    } else if (mode === 'kahoot') {
        // For demo, start with general knowledge
        currentCategory = 'Conocimiento General';
        startQuiz();
    }
}