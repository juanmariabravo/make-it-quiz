En este documento encontrarás una lista de tareas pendientes y mejoras que se pueden implementar en el proyecto en el futuro. Estas tareas están organizadas por categorías y priorizadas según su importancia y complejidad.

# TODO

### Mayor prioridad

- [ ] Completar el desarrollo de las funcionalidades básicas de los 4 modos de juego. Por hacer queda:
- [x] Modo CLI
- [ ] Modo Kahoot (llamarlo modo Fiesta)

##### Correcciones de errores

- [ ] En el modo CLI, el conteo de puntos no se hace correctamente.
- [x] Al pasar a la siguiente pregunta, la opción seleccionada en la pregunta anterior no se deselecciona.
- [ ] Al desplazarse a preguntas anteriormente contestadas, en ocasiones se "olvida" la respuesta indicada y se permite volver a seleccionar una respuesta. Esto hace que la suma de puntos sea incorrecta. No se debería permitir volver a responder a una pregunta ya contestada, y si se hace, se debería restar la puntuación obtenida anteriormente.

##### Nuevas funcionalidades prácticas

- [ ] Test aleatorios: de una categoría de muchas preguntas, seleccionar un número concreto de preguntas aleatorias para jugar.
- [ ] Permitir omitir el clic en Comprobar en el modo Estudio. Antes de jugar, checkbox con la opción de "Permitir cambiar respuesta".
- [ ] Añadir un botón de "Ayuda" en cada pregunta para consultar antes o después de contestar en el modo Estudio, o después de contestar en el modo Examen. Esto implica cambiar el formato de los archivos de preguntas para incluir una línea o clave del json que contenga la ayuda para cada pregunta. Aprovechando esta modificación, se puede añadir otro campo para incluir una imagen o vídeo que acompañe a la pregunta, y también se puede añadir un campo para incluir una pista o sugerencia que se muestre al usuario antes de responder.
- [~] (a medio hacer) Permitir calificaciones más restrictivas como que se aplique penalización (parametrizada y elegible) por cada respuesta incorrecta, o que se aplique un ajuste en la calificación final para corregir el factor de aleatoriedad de las respuestas.
- [ ] Opción de guardar resultados en un archivo de texto o JSON al finalizar el juego, para que el usuario pueda revisar sus respuestas y puntuación posteriormente.
- [ ] Poder modificar el tiempo en cada categoría de preguntas. Actualmente, el tiempo se calcula con 30 segundos por pregunta (línea 57 de `src\app\play\exam\page.tsx`).

### Mejoras futuras menos urgentes

##### Funcionalidades adicionales

- [ ] Crear un menú de opciones para cada test (mal llamado categoría). También un menú de opciones por defecto para cada modo de juego, que permita cambiar el tiempo por pregunta, activar o desactivar la penalización por respuestas incorrectas, activar o desactivar la opción de cambiar respuesta, etc. Este menú debería ser accesible desde el inicio del juego y también desde el menú de pausa durante el juego.
- [ ] Implementar nuevos modos de juego o adaptar el modo Kahoot (llamarlo modo Fiesta).
- [ ] Modo "Adivina la respuesta" (pregunta con opciones múltiples).
- [ ] Modo "Completa la frase" (pregunta con una palabra o frase a completar).
- [ ] Modo "Ordena las respuestas" (pregunta con varias respuestas que deben ordenarse).
- [ ] Modo "Verdadero o falso" (pregunta con dos opciones: verdadero o falso).
- [ ] Permitir a los usuarios personalizar sus categorías de preguntas y crear nuevas categorías. Permitir a los usuarios añadir sus propias preguntas desde la interfaz del juego, tanto de forma manual como importando archivos JSON o TXT. Esto implica crear un formulario para añadir preguntas y un sistema para validar y almacenar las preguntas añadidas por los usuarios.
- [ ] Añadir una opción para revisar las respuestas al final del juego.
- [ ] Implementar un sistema de logros o recompensas.

### A nivel más técnico y de mantenimiento y escalabilidad
- [ ] El script de python `scripts/parse_quizzes.py`, que se debe ejecutar cada vez que queremos cargar un nuevo quiz o categoría de preguntas, debería ejecutarse automáticamente al recargar la sección de elección de categorías. Además, hace una tarea redundante y es que vuelve a parsear todos los archivos de preguntas. Debería parsear solo si hay cambios en los archivos de preguntas y los nuevos.

### Pequeños detalles de usabilidad
- [x] Hacer que la opción clicable abarque todo el recuadro de la respuesta. Arreglado el 28/05/2025 a las 19:15.