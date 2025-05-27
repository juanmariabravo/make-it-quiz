# make-it-quiz - Tus preguntas, tu juego
Herramienta para crear y jugar tests interativos **personalizados** con múltiples modos de juego (estudio, CLI, examen, Kahoot-like)

## 🚀 Características  
- Añade preguntas en TXT/JSON (ver [Formato de preguntas](data\README.md)).
- Modos de juego: Estudio, Examen (contrarreloj), Kahoot, CLI-Terminal.  
- Fácil contribución: ¡Añade tus bancos de preguntas!  

## 📦 Instalación  
```bash
git clone https://github.com/tu-usuario/quiz-maker.git
cd quiz-maker
```

## ⚠️ Requisitos previos

- Node.js **v18.18.0** o superior (recomendado v20+)
- npm (incluido con Node.js)

Puedes comprobar tu versión de Node.js con:
```bash
node -v
```

## 🛠️ Uso del dev
```shell
cd src
npm install # o npm install --legacy-peer-deps en caso de problemas con dependencias
npm run dev
```

## 🆕 Crear o añadir mis propias preguntas
- Puedes añadir tus preguntas en formato JSON o TXT, pero **debes seguir el formato correcto** (ver [Formato de preguntas](data\README.md)).
- Cada archivo puede contener varias preguntas, y puedes crear tantos archivos como quieras.
- Cada archivo aparecerá en el juego como una categoría diferente, que se podrá seleccionar al inicio del juego.
%% Mostrar captura de archivos (uno de cada tipo) y su contenido. Mostrar cómo se ven en el juego (selección de categorías).

## 🎮 Modos de juego
En primer lugar, selecciona el modo de juego que deseas. Puedes elegir entre:
- **Estudio**: Un modo de juego más relajado, donde puedes estudiar las preguntas a tu ritmo y comprobar si has acertado tras contestar cada una. Se irá contando la puntuación.
- **Examen**: Un modo de juego contrarreloj, donde debes responder a todas las preguntas antes de que se acabe el tiempo. Al final del examen, se mostrará la puntuación total. ¿Habrás conseguido el aprobado?
- **Kahoot**: Un modo de juego similar a Kahoot, donde puedes jugar con amigos y competir por puntos. El que primero conteste correctamente a la pregunta, ganará más puntos.
- **CLI**: Un modo de juego en la terminal, donde puedes jugar a preguntas y respuestas en un entorno de línea de comandos. Ideal para aquellos que prefieren una experiencia más técnica.

## 📜 Contribuciones

Si deseas contribuir al proyecto, puedes hacerlo de varias maneras:
- **Añadiendo preguntas**: Puedes crear tus propios bancos de preguntas en formato JSON o TXT y enviarlos como pull request.
- **Desarrollando nuevas funciones**: Si tienes una idea para una nueva función o mejora, no dudes en abrir un issue o enviar un pull request.
- **Mejorando el código**: Si encuentras errores o tienes ideas para mejorar el código, no dudes en abrir un issue o enviar un pull request.
- **Reportando errores**: Si encuentras algún error o problema, por favor, abre un issue en el repositorio para que podamos solucionarlo.
- **Sugerencias**: Si tienes alguna sugerencia o idea para mejorar el proyecto, no dudes en abrir un issue o enviarnos un correo electrónico.

## 📄 Licencia
Este proyecto está bajo la Licencia MIT. Puedes ver el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto
Si tienes alguna pregunta o comentario, no dudes en ponerte en contacto con nosotros a través de nuestro correo electrónico: [](mailto:)

## 👥 Autores

- [Juan María Bravo López](https://github.com/juanmariabravo/)
