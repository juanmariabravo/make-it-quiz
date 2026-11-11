"""
Servidor HTTP simple para Make It Quiz
Ejecuta desde la raíz: python server.py
"""
import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Limpiar parámetros de query
        path = self.path.split('?')[0]
        
        # Redirigir la raíz a src/index.html
        if path == '/' or path == '':
            self.path = '/src/index.html'
        # Redirigir recursos de src/
        elif path.startswith('/styles/') or path.startswith('/scripts/'):
            self.path = '/src' + path
        elif path.endswith('.html') and not path.startswith('/src/'):
            self.path = '/src' + path
        
        return super().do_GET()

if __name__ == '__main__':
    print(f"📁 Directorio: {os.getcwd()}")
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"✓ Servidor en http://localhost:{PORT}")
        print(f"✓ Abre http://localhost:{PORT} en tu navegador")
        print(f"✓ Presiona Ctrl+C para detener\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✓ Servidor detenido")
