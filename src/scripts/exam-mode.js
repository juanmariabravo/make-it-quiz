const DATA_DIR = '../data/';

async function fetchCategories() {
  const res = await fetch(DATA_DIR + 'categories.json');
  return await res.json();
}

async function fetchQuestions(filename) {
  if (filename.endsWith('.json')) {
    const res = await fetch(DATA_DIR + filename);
    const data = await res.json();
    return data.questions.map(q => ({
      question: q.question,
      options: q.options,
      answer: q.answer,
      points: q.points ?? 1
    }));
  } else if (filename.endsWith('.txt')) {
    const res = await fetch(DATA_DIR + filename);
    const text = await res.text();
    const blocks = text.trim().split(/\n\s*\n/);
    const questions = [];
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (!lines[0]) continue;
      const qtext = lines[0];
      const options = [];
      let answer = null;
      let points = 1;
      for (const line of lines.slice(1)) {
        const optMatch = line.match(/^([a-dA-D])\)\s*(.+)/);
        if (optMatch) {
          options.push(optMatch[2]);
        } else if (line.toLowerCase().startsWith('solución:')) {
          const answerLetter = line.split(':')[1].trim().toLowerCase().replace(')', '');
          answer = answerLetter.charCodeAt(0) - 'a'.charCodeAt(0);
        } else if (line.toLowerCase().startsWith('puntos:')) {
          points = parseInt(line.split(':')[1].trim()) || 1;
        }
      }
      if (qtext && options.length && answer !== null) {
        questions.push({ question: qtext, options, answer, points });
      }
    }
    return questions;
  }
  return [];
}

let questions = [];
let current = 0;
let selected = null;
let userAnswers = [];
let correctCount = 0;
let timerInterval;
let examDuration = 600; // segundos (10 minutos)
let timeLeft = examDuration;

function showQuestion(idx) {
  selected = userAnswers[idx] ?? null;
  const q = questions[idx];
  document.getElementById('question-text').textContent = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = `${String.fromCharCode(97 + i)}) ${opt}`;
    if (selected === i) btn.classList.add('selected');
    btn.onclick = () => {
      selected = i;
      userAnswers[idx] = i;
      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('next-question').style.display = '';
    };
    optionsDiv.appendChild(btn);
  });
  document.getElementById('next-question').style.display = selected !== null ? '' : 'none';
  document.getElementById('progress').textContent = `Pregunta ${idx + 1} de ${questions.length}`;
}

function startTimer() {
  timeLeft = examDuration;
  updateTimerDisplay();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      document.getElementById('timer').style.color = 'red';
      clearInterval(timerInterval); // Opcional: para que no siga restando
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(Math.max(timeLeft, 0) / 60).toString().padStart(2, '0');
  const sec = (Math.max(timeLeft, 0) % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `Tiempo restante: ${min}:${sec}`;
  if (timeLeft > 0) {
    document.getElementById('timer').style.color = '';
  }
}

// Inicia el temporizador al comenzar el examen
document.getElementById('load-category').onclick = async () => {
  const select = document.getElementById('category');
  const filename = select.value;
  try {
    questions = await fetchQuestions(filename);
    if (!questions.length) throw new Error('No se encontraron preguntas en esta categoría.');
    current = 0;
    userAnswers = [];
    correctCount = 0;
    document.getElementById('category-select').style.display = 'none';
    document.getElementById('exam-area').style.display = '';
    document.getElementById('exam-result').style.display = 'none';
    showQuestion(current);
    startTimer(); // <-- Añade esto aquí
  } catch (err) {
    alert('Error al cargar el archivo de preguntas:\n' + (err.message || err));
  }
};

document.getElementById('next-question').onclick = () => {
  if (selected === null) return;
  if (current < questions.length - 1) {
    current++;
    showQuestion(current);
  } else {
    showExamResult();
  }
};

function showExamResult() {
  correctCount = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) correctCount++;
  });

let resultHTML = `<h2>¡Examen finalizado!</h2>
    <p style="font-size:1.2em;">Puntuación: <strong>${correctCount}</strong> de <strong>${questions.length}</strong></p>
    <button id="review-btn" class="btn btn-secondary" style="margin-bottom:16px; border:2px solid #007bff; border-radius:6px; background:#fff; color:#007bff; padding:8px 18px; font-weight:bold; cursor:pointer;">Revisar</button>
    <button onclick="window.location.reload()" class="btn btn-secondary" style="border:2px solid #28a745; border-radius:6px; background:#fff; color:#28a745; padding:8px 18px; font-weight:bold; cursor:pointer; margin-left:10px;">Volver a empezar</button>
    <div id="review-section" style="display:none;"></div>
`;

  document.getElementById('exam-area').style.display = 'none';
  document.getElementById('exam-result').style.display = '';
  document.getElementById('exam-result').innerHTML = resultHTML;

  document.getElementById('review-btn').onclick = () => {
    let reviewHTML = `<ul style="list-style:none;padding:0;">`;
    questions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      const isCorrect = userAns === q.answer;
      reviewHTML += `<li style="margin-bottom:18px;">
        <div><strong>${idx + 1}. ${q.question}</strong></div>
        <div>
          ${q.options.map((opt, i) => {
            let cls = '';
            if (i === q.answer) cls = 'correct';
            if (userAns === i && !isCorrect) cls = 'incorrect';
            return `<span class="option-btn ${cls}" style="margin-right:6px;display:inline-block;">${String.fromCharCode(97 + i)}) ${opt}</span>`;
          }).join('')}
        </div>
        <div>
          ${isCorrect
            ? '<span style="color:#3bb273;font-weight:bold;">✔ Correcto</span>'
            : `<span style="color:#e74c3c;font-weight:bold;">✘ Incorrecto</span> (Correcta: ${String.fromCharCode(97 + q.answer)})`}
        </div>
      </li>`;
    });
    reviewHTML += `</ul>`;
    document.getElementById('review-section').innerHTML = reviewHTML;
    document.getElementById('review-section').style.display = '';
    document.getElementById('review-btn').style.display = 'none';
  };
}

// Inicializa categorías al cargar
window.onload = async () => {
  const categories = await fetchCategories();
  const select = document.getElementById('category');
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
};