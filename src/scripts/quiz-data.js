// scripts/quiz-data.js
async function loadQuestions() {
  const response = await fetch('../data/musica.json');
  return await response.json();
}

// Quiz Data
const quizData = {
    'Conocimiento General': [
        {
            question: "¿Cuál es la capital de Francia?",
            answers: ["París", "Londres", "Berlín", "Madrid"],
            correct: 0
        },
        {
            question: "¿Qué planeta es conocido como el planeta rojo?",
            answers: ["Venus", "Marte", "Júpiter", "Saturno"],
            correct: 1
        },
        {
            question: "¿En qué año llegó el hombre a la Luna?",
            answers: ["1967", "1968", "1969", "1970"],
            correct: 2
        }
    ],
    'Programación': [
        {
            question: "¿Cuál de estos NO es un lenguaje de programación?",
            answers: ["Java", "Python", "HTML", "C++"],
            correct: 2
        },
        {
            question: "¿Qué significa HTML?",
            answers: ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "High Tech Modern Language"],
            correct: 0
        },
        {
            question: "¿Cuál es el resultado de 2 + 2 * 3 en programación?",
            answers: ["12", "8", "6", "10"],
            correct: 1
        }
    ]
};