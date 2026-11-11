// scripts/app.js

// Only add event listener if the element exists
const playBtn = document.getElementById("play-btn");
if (playBtn) {
    playBtn.addEventListener("click", () => {
        window.location.href = "play.html";
    });
}

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
    if (themeBtn) {
        themeBtn.textContent = document.body.classList.contains('dark') ? '🌙' : '☀️';
    }

    // Save theme preference
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = '🌙';
        }
    }
});

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
    }
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