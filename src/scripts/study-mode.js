// study-mode.js

// Cambia esta ruta si tus archivos están en otro sitio
const DATA_DIR = '../data/';

async function fetchCategories() {
  // No es posible leer el directorio entero directamente desde el navegador por razones de seguridad.
  // Debes tener un archivo (por ejemplo, categories.json) generado por el backend con la lista de archivos.
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
    // Parse TXT as in Python
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
let correctCount = 0; // <-- Añade esta línea

function showQuestion(idx) {
  selected = null;
  const q = questions[idx];
  document.getElementById('question-text').textContent = q.question;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = `${String.fromCharCode(97 + i)}) ${opt}`;
    btn.onclick = () => {
      if (selected !== null) return; // Evita doble click
      selected = i;
      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected', 'correct', 'incorrect'));
      btn.classList.add('selected');
      if (selected === q.answer) {
        btn.classList.add('correct');
        document.getElementById('answer-feedback').textContent = '¡Correcto!';
        correctCount++; // <-- Suma si es correcta
      } else {
        btn.classList.add('incorrect');
        optionsDiv.children[q.answer].classList.add('correct');
        document.getElementById('answer-feedback').textContent = `Incorrecto. La respuesta era: ${String.fromCharCode(97 + q.answer)}) ${q.options[q.answer]}`;
      }
      document.getElementById('next-question').style.display = '';
    };
    optionsDiv.appendChild(btn);
  });
  document.getElementById('show-answer').style.display = 'none';
  document.getElementById('answer-feedback').textContent = '';
  document.getElementById('next-question').style.display = 'none';
  document.getElementById('progress').textContent = `Pregunta ${idx + 1} de ${questions.length}`;
}

document.getElementById('load-category').onclick = async () => {
  const select = document.getElementById('category');
  const filename = select.value;
  try {
    questions = await fetchQuestions(filename);
    if (!questions.length) {
      throw new Error('No se encontraron preguntas en esta categoría.');
    }
    current = 0;
    correctCount = 0;
    document.getElementById('category-select').style.display = 'none';
    document.getElementById('study-area').style.display = '';
    showQuestion(current);
  } catch (err) {
    alert('Error al cargar el archivo de preguntas. Revise que el listado categories.json se corresponde correctamente con los archivos de preguntas de data/\n' + (err.message || err));
  }
};

document.getElementById('show-answer').onclick = () => {
  if (selected === null) return;
  const q = questions[current];
  const correct = selected === q.answer;
  document.getElementById('answer-feedback').textContent = correct
    ? '¡Correcto!'
    : `Incorrecto. La respuesta era: ${String.fromCharCode(97 + q.answer)}) ${q.options[q.answer]}`;
  document.getElementById('next-question').style.display = '';
};

document.getElementById('next-question').onclick = () => {
  if (current < questions.length - 1) {
    current++;
    showQuestion(current);
  } else {
    document.getElementById('study-area').innerHTML =
      `<h2>¡Has terminado el modo estudio!</h2>
      <p>Respuestas correctas: <strong>${correctCount}</strong> de <strong>${questions.length}</strong></p>`;
  }
};

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