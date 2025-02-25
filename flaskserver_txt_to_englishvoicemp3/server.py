from flask import Flask, request, send_file
from gtts import gTTS
import os
import re
from flask_cors import CORS  # Obsługa CORS

app = Flask(__name__)
CORS(app)  # Włącz CORS


def sanitize_filename(text):
    """Usuwa spacje, znaki specjalne i ogranicza długość nazwy pliku do 50 znaków"""
    filename = re.sub(r'\W+', '_', text).strip('_')[:50]  # Usuwa znaki specjalne i ogranicza długość
    return filename if filename else "output"  # Domyślna nazwa, jeśli pusty


@app.route('/generate-mp3', methods=['POST'])
def generate_mp3():
    text = request.json.get('text')
    if not text:
        return {"status": "error", "message": "No text provided"}, 400

    # Generowanie poprawnej nazwy pliku
    filename = sanitize_filename(text) + ".mp3"
    filepath = os.path.join("mp3_files", filename)

    # Tworzenie folderu, jeśli nie istnieje
    os.makedirs("mp3_files", exist_ok=True)

    # Generowanie pliku MP3
    tts = gTTS(text, lang='en')
    tts.save(filepath)

    # Zwrócenie pełnej ścieżki pliku MP3
    file_url = f"/mp3_files/{filename}"
    return {"status": "success", "file": file_url}


@app.route('/mp3_files/<filename>')
def serve_mp3(filename):
    filepath = os.path.join("mp3_files", filename)

    if not os.path.exists(filepath):
        return {"status": "error", "message": "File not found"}, 404

    # Wymuszenie pobrania pliku (dodanie nagłówka)
    return send_file(filepath, as_attachment=True, download_name=filename)


if __name__ == '__main__':
    app.run(port=5000)
