import os
import json
import re
import time

DATA_DIR = os.path.join(os.path.dirname(__file__), '../data')

def list_categories():
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.json') or f.endswith('.txt')]
    return files

def load_questions(filename):
    path = os.path.join(DATA_DIR, filename)
    if filename.endswith('.json'):
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
            questions = []
            for q in data.get('questions', []):
                questions.append({
                    'question': q['question'],
                    'options': q['options'],
                    'answer': q['answer'],
                    'points': q['points'] if 'points' in q else 1
                })
            return questions
    elif filename.endswith('.txt'):
        with open(path, encoding='utf-8') as f:
            content = f.read()
        blocks = re.split(r'\n\s*\n', content.strip())
        questions = []
        for block in blocks:
            lines = block.strip().split('\n')
            if not lines or not lines[0].strip():
                continue
            qtext = lines[0]
            options = []
            answer = None
            points = 1
            for line in lines[1:]:
                opt_match = re.match(r'([a-dA-D])\)\s*(.+)', line)
                if opt_match:
                    options.append(opt_match.group(2))
                elif line.lower().startswith('solución:'):
                    answer_part = line.split(':',1)[1].strip().lower()
                    # Check if multiple answers (e.g., "a), b), d)" or "a, b, d")
                    letters = re.findall(r'[a-d]', answer_part)
                    if len(letters) > 1:
                        # Multiple answers
                        answer = [ord(l) - ord('a') for l in letters]
                    else:
                        # Single answer
                        answer = ord(letters[0]) - ord('a') if letters else None
                elif line.lower().startswith('puntos:'):
                    try:
                        points = int(line.split(':',1)[1].strip())
                    except:
                        points = 1
            if qtext and options and answer is not None:
                questions.append({
                    'question': qtext,
                    'options': options,
                    'answer': answer,
                    'points': points
                })
        return questions
    else:
        return []

def ask_yes_no(prompt):
    while True:
        ans = input(prompt + " (s/n): ").strip().lower()
        if ans in ['s', 'n']:
            return ans == 's'

def ask_choice(prompt, choices):
    while True:
        ans = input(prompt).strip().lower()
        if ans in choices:
            return choices.index(ans)
        print("Opción no válida. Intenta de nuevo.")

def main():
    print("Bienvenido al modo de juego CLI.")
    print("Por favor, elige una categoría:")
    files = list_categories()
    for idx, fname in enumerate(files):
        print(f"{idx+1}) {fname}")
    while True:
        try:
            cat_idx = int(input("Número de categoría: ")) - 1
            if 0 <= cat_idx < len(files):
                break
        except:
            pass
        print("Selección inválida.")
    questions = load_questions(files[cat_idx])
    if not questions:
        print("No se encontraron preguntas en esta categoría.")
        return

    timed = ask_yes_no("¿Quieres jugar con tiempo?")
    count_points = ask_yes_no("¿Quieres que contemos los puntos?")
    feedback = ask_yes_no("¿Quieres saber si has acertado tras cada pregunta?")

    print("\nGenial. ¡Comencemos!")
    print("Teclea la letra de la opción que quieras responder y dale a intro para pasar a la siguiente.\n")

    total_points = 0
    max_points = 0
    correct = 0
    start_time = time.time()

    for idx, q in enumerate(questions):
        is_multi = isinstance(q['answer'], list)
        print(f"{idx+1}. {q['question']}")
        if is_multi:
            print("  (Selecciona todas las correctas, separadas por comas)")
        for i, opt in enumerate(q['options']):
            print(f"  {chr(ord('a')+i)}) {opt}")
        
        valid_opts = [chr(ord('a')+i) for i in range(len(q['options']))]
        
        if is_multi:
            while True:
                ans_str = input("Tu respuesta (ej: a,b,d): ").strip().lower()
                ans_letters = [c for c in ans_str if c in valid_opts]
                if ans_letters:
                    ans_idx = [ord(l) - ord('a') for l in ans_letters]
                    break
                print("Opción no válida. Intenta de nuevo.")
            
            sorted_ans = sorted(ans_idx)
            sorted_correct = sorted(q['answer'])
            is_correct = (sorted_ans == sorted_correct)
            
            if feedback:
                if is_correct:
                    print("¡Correcto!")
                else:
                    correct_letters = ','.join([chr(ord('a')+i) for i in q['answer']])
                    print(f"Incorrecto. Las respuestas correctas eran: {correct_letters}")
        else:
            ans_idx = ask_choice("Tu respuesta: ", valid_opts)
            is_correct = (ans_idx == q['answer'])
            
            if feedback:
                print("¡Correcto!" if is_correct else f"Incorrecto. La respuesta era: {chr(ord('a')+q['answer'])}) {q['options'][q['answer']]}")
        
        if count_points and is_correct:
            total_points += q['points']
        max_points += q['points']
        if is_correct:
            correct += 1
        print()
        if timed:
            pass  # Could add per-question timer here

    elapsed = time.time() - start_time
    print("Juego terminado.")
    print(f"Respuestas correctas: {correct} de {len(questions)}")
    if count_points:
        print(f"Puntuación total: {total_points} de {max_points} puntos posibles")
    if timed:
        print(f"Tiempo total: {int(elapsed)} segundos")

if __name__ == "__main__":
    main()