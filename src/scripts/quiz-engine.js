// quiz-engine.js - Unified Quiz Engine for all game modes

class QuizEngine {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.correctCount = 0;
        this.mode = null;
        this.category = null;
        this.timer = null;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.listeners = {};
    }

    // Event system for UI updates
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Load questions from file
    async loadQuestions(filename) {
        const DATA_DIR = 'data/';

        if (filename.endsWith('.json')) {
            const res = await fetch(DATA_DIR + filename);
            const data = await res.json();
            this.questions = data.questions.map(q => ({
                question: this.cleanQuestionText(q.question),
                options: q.options.map(opt => this.cleanOptionText(opt)),
                answer: q.answer,
                points: q.points ?? 1
            }));
        } else if (filename.endsWith('.txt')) {
            const res = await fetch(DATA_DIR + filename);
            const text = await res.text();
            this.questions = this.parseTxtQuestions(text);
        }

        return this.questions;
    }

    // Clean question text (remove indices like "1.", "2)", etc.)
    cleanQuestionText(text) {
        return text.replace(/^\d+[\.\)]\s*/, '').trim();
    }

    // Clean option text (remove indices like "a)", "1.", etc.)
    cleanOptionText(text) {
        return text.replace(/^[a-dA-D0-9][\.\)]\s*/, '').trim();
    }

    // Parse TXT format questions
    parseTxtQuestions(text) {
        const blocks = text.trim().split(/\n\s*\n/);
        const questions = [];

        for (const block of blocks) {
            const lines = block.trim().split('\n');
            if (!lines[0]) continue;

            const qtext = this.cleanQuestionText(lines[0]);
            const options = [];
            let answer = null;
            let points = 1;

            for (const line of lines.slice(1)) {
                const optMatch = line.match(/^([a-dA-D0-9])[\.\)]\s*(.+)/);
                if (optMatch) {
                    options.push(this.cleanOptionText(optMatch[2]));
                } else if (line.toLowerCase().startsWith('solución:')) {
                    const answerPart = line.split(':')[1].trim().toLowerCase();
                    answer = this.parseAnswer(answerPart);
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

    // Parse answer (supports single and multiple answers)
    parseAnswer(answerText) {
        const letters = answerText.match(/[a-d0-9]/g) || [];

        if (letters.length > 1) {
            // Multiple answers
            return letters.map(l => {
                if (l >= '0' && l <= '9') {
                    return parseInt(l);
                }
                return l.charCodeAt(0) - 'a'.charCodeAt(0);
            });
        } else if (letters.length === 1) {
            // Single answer
            const letter = letters[0];
            if (letter >= '0' && letter <= '9') {
                return parseInt(letter);
            }
            return letter.charCodeAt(0) - 'a'.charCodeAt(0);
        }

        return null;
    }

    // Load categories
    async loadCategories() {
        const res = await fetch('data/categories.json');
        return await res.json();
    }

    // Initialize quiz
    init(mode, category, options = {}) {
        this.mode = mode;
        this.category = category;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.correctCount = 0;

        if (options.timePerQuestion) {
            this.timeLeft = options.timePerQuestion;
        }
        if (options.totalTime) {
            this.totalTime = options.totalTime;
            this.timeLeft = options.totalTime;
        }

        this.emit('init', { mode, category });
    }

    // Get current question
    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    // Check if current question has multiple answers
    isMultipleAnswer() {
        const q = this.getCurrentQuestion();
        return Array.isArray(q.answer);
    }

    // Submit answer
    submitAnswer(answer) {
        this.userAnswers[this.currentQuestionIndex] = answer;
        const isCorrect = this.checkAnswer(answer);

        if (isCorrect) {
            this.correctCount++;
            const q = this.getCurrentQuestion();
            this.score += q.points || 1;
        }

        this.emit('answerSubmitted', {
            answer,
            isCorrect,
            correctAnswer: this.getCurrentQuestion().answer
        });

        return isCorrect;
    }

    // Check if answer is correct
    checkAnswer(userAnswer) {
        const q = this.getCurrentQuestion();

        if (Array.isArray(q.answer)) {
            // Multiple answers
            if (!Array.isArray(userAnswer)) return false;
            const sortedUser = [...userAnswer].sort();
            const sortedCorrect = [...q.answer].sort();
            return sortedUser.length === sortedCorrect.length &&
                sortedUser.every((val, i) => val === sortedCorrect[i]);
        } else {
            // Single answer
            return userAnswer === q.answer;
        }
    }

    // Go to next question
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.emit('questionChanged', {
                index: this.currentQuestionIndex,
                question: this.getCurrentQuestion()
            });
            return true;
        }
        return false;
    }

    // Go to previous question
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.emit('questionChanged', {
                index: this.currentQuestionIndex,
                question: this.getCurrentQuestion()
            });
            return true;
        }
        return false;
    }

    // Get user's answer for current question
    getUserAnswer() {
        return this.userAnswers[this.currentQuestionIndex];
    }

    // Start timer
    startTimer(duration, onTick, onEnd) {
        this.timeLeft = duration;
        this.stopTimer();

        this.timer = setInterval(() => {
            this.timeLeft--;
            if (onTick) onTick(this.timeLeft);
            this.emit('timerTick', this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stopTimer();
                if (onEnd) onEnd();
                this.emit('timerEnd');
            }
        }, 1000);
    }

    // Stop timer
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // Get results
    getResults() {
        return {
            totalQuestions: this.questions.length,
            correctCount: this.correctCount,
            score: this.score,
            percentage: Math.round((this.correctCount / this.questions.length) * 100),
            userAnswers: this.userAnswers,
            questions: this.questions
        };
    }

    // Get detailed review
    getReview() {
        return this.questions.map((q, idx) => {
            const userAnswer = this.userAnswers[idx];
            const isCorrect = this.checkAnswerAtIndex(idx, userAnswer);

            return {
                question: q.question,
                options: q.options,
                correctAnswer: q.answer,
                userAnswer: userAnswer,
                isCorrect: isCorrect,
                points: q.points
            };
        });
    }

    // Check answer at specific index
    checkAnswerAtIndex(index, userAnswer) {
        const q = this.questions[index];

        if (Array.isArray(q.answer)) {
            if (!Array.isArray(userAnswer)) return false;
            const sortedUser = [...userAnswer].sort();
            const sortedCorrect = [...q.answer].sort();
            return sortedUser.length === sortedCorrect.length &&
                sortedUser.every((val, i) => val === sortedCorrect[i]);
        } else {
            return userAnswer === q.answer;
        }
    }

    // Reset quiz
    reset() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.correctCount = 0;
        this.stopTimer();
        this.emit('reset');
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.QuizEngine = QuizEngine;
}
