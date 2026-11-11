# 🎯 Make It Quiz - Guía de Uso

## ✅ La aplicación está lista y funcionando

### 📦 Lo que se ha implementado:

1. ✅ **Soporte para preguntas con múltiples respuestas correctas**
   - Las preguntas con respuestas múltiples usan checkboxes
   - Las preguntas con una sola respuesta usan botones
   - Detección automática según el formato de la solución

2. ✅ **Servidor HTTP local configurado**
   - Resuelve problemas de CORS
   - Permite cargar archivos JSON y TXT

3. ✅ **Todas las rutas corregidas**
   - CSS, JavaScript y navegación funcionan correctamente

---

## 🚀 Cómo usar la aplicación:

### 1. Iniciar el servidor

Desde la carpeta raíz del proyecto, ejecuta:

```powershell
python server.py
```

Verás:
```
📁 Directorio: C:\Users\Juan María\source\repos\make-it-quiz
✓ Servidor en http://localhost:8000
✓ Presiona Ctrl+C para detener
```

### 2. Abrir en el navegador

Abre tu navegador y ve a:
```
http://localhost:8000
```

### 3. Probar la funcionalidad

1. Haz clic en **"¡Jugar ahora!"**
2. Elige un modo:
   - **📖 Modo Estudio**: Estudia sin presión de tiempo
   - **⏰ Modo Examen**: Con tiempo limitado
3. Selecciona una categoría (prueba **"ejemplo-multiple.txt"** para ver preguntas con múltiples respuestas)
4. ¡Comienza a jugar!

---

## 📝 Formato de preguntas con múltiples respuestas

### Ejemplo en archivo .txt:

```
34. ¿Cuáles de los siguientes componentes forman parte del paquete XAMPP?
a) FileZilla Server
b) Mercury Mail Server
c) Fire server
d) Apache Tomcat
Solución: a), b), d)
```

### Formatos aceptados para múltiples respuestas:

- `Solución: a), b), d)` ✅
- `Solución: a, b, d` ✅
- `Solución: abd` ✅

### Para una sola respuesta:

```
1. ¿Cuál es la capital de España?
a) Madrid
b) Barcelona
c) Sevilla
d) Valencia
Solución: a)
```

---

## 🎮 Diferencias entre modos:

### Modo Estudio 📖
- Sin límite de tiempo
- Feedback inmediato después de cada respuesta
- Contador de aciertos/errores visible
- Ideal para aprender

### Modo Examen ⏰
- Con temporizador (10 minutos por defecto)
- Sin feedback hasta el final
- Puntuación final con revisión
- Ideal para evaluación

---

## 🐛 Solución de problemas:

### Si ves "Error al cargar categorías":
1. Verifica que el servidor está corriendo (`python server.py`)
2. Asegúrate de estar en `http://localhost:8000` (no `file://`)
3. Recarga la página (F5)

### Si el puerto 8000 está ocupado:
```powershell
# Cerrar el proceso que usa el puerto
Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Reiniciar el servidor
python server.py
```

---

## 📂 Archivos importantes:

- `server.py` - Servidor HTTP local
- `data/ejemplo-multiple.txt` - Ejemplo de preguntas con múltiples respuestas
- `data/categories.json` - Lista de categorías disponibles
- `src/scripts/study-mode.js` - Lógica del modo estudio
- `src/scripts/exam-mode.js` - Lógica del modo examen

---

## ✨ ¡Listo para usar!

Todo está configurado y funcionando. Disfruta creando y jugando con tus propias preguntas.
