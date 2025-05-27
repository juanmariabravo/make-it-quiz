import json
import os
from pathlib import Path
from typing import List, Dict, Union

class Question:
    def __init__(self, question: str, options: List[str], answer: int, points: int = 1):
        self.question = question
        self.options = options
        self.answer = answer
        self.points = points

def parse_txt(content: str) -> List[Question]:
    questions = []
    blocks = [b.strip() for b in content.split('\n\n') if b.strip()]
    
    for block in blocks:
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        if len(lines) < 3:  # Pregunta + 2 opciones + solución
            continue
            
        question = lines[0]
        options = []
        answer = -1
        points = 1
        
        for line in lines[1:]:
            if line.lower().startswith(('a)', 'b)', 'c)', 'd)')):
                options.append(line[2:].strip())
            elif 'solución:' in line.lower():
                letter = line.split(':')[1].strip()[0].lower()
                answer = {'a': 0, 'b': 1, 'c': 2, 'd': 3}.get(letter, -1)
            elif 'puntos:' in line.lower():
                points = int(line.split(':')[1].strip())
        
        if question and options and answer != -1:
            questions.append(Question(question, options, answer, points).__dict__)
    
    return questions

def parse_json(content: str) -> List[Question]:
    try:
        data = json.loads(content)
        return [
            Question(
                q['question'],
                q['options'],
                q['answer'],
                q.get('points', 1)
            ).__dict__
            for q in data.get('questions', [])
        ]
    except json.JSONDecodeError:
        return []

def main():
    data_dir = Path(__file__).parent.parent / 'data'
    output_file = Path(__file__).parent.parent / 'src' / 'public' / 'quizzes.json'
    categories = []
    
    for file in data_dir.glob('*'):
        if file.suffix not in ('.txt', '.json'):
            continue
            
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            questions = parse_txt(content) if file.suffix == '.txt' else parse_json(content)
            
            if questions:
                categories.append({
                    'id': file.stem.lower().replace(' ', '-'),
                    'name': file.stem,
                    'questions': questions
                })
    
    with open(output_file, 'w+', encoding='utf-8') as f:
        json.dump(categories, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Generated {output_file} with {len(categories)} categories")

if __name__ == '__main__':
    main()