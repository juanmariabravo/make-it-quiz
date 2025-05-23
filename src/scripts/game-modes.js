// scripts/game-modes.js
async function startExamMode() {
  const questions = await loadQuestions();
  let currentQuestion = 0;
  let score = 0;

  function displayQuestion() {
    const question = questions[currentQuestion];
    document.getElementById("question").innerText = question.question;
    // Mostrar opciones y manejar respuestas...
  }

  displayQuestion();
}