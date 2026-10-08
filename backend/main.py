from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import subprocess

from transcribe import transcribe, temporary
from parser import parse_worship


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


UPLOAD_DIR = Path("data/recordings")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.post("/api/audio")
async def receive_audio(audio: UploadFile = File(...)):

    webm_path = UPLOAD_DIR / "recording.webm"
    wav_path = UPLOAD_DIR / "recording.wav"

    with open(webm_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", str(webm_path),
            "-ar", "16000",
            "-ac", "1",
            str(wav_path)
        ],
        check=True
    )

    print(f"WebM сохранён: {webm_path}")
    print(f"WAV сохранён: {wav_path}")

    text = temporary

    fragments = [
        {
            "id": 1,
            "title": "Литургия",
            "text": "Благословен Бог наш, всегда, ныне и присно и во веки веков.",
            "date": "2026-10-08"
        },
        {
            "id": 2,
            "title": "Вечерня",
            "text": "Свете тихий святыя славы...",
            "date": "2026-10-08"
        },
        {
            "id": 3,
            "title": "Утреня",
            "text": "Слава Тебе, показавшему нам свет.",
            "date": "2026-10-08"
        }
    ]

    return {
        "status": "success",
        "filename": "recording.wav",
        "transcription": text,
        "fragments": fragments
    }


@app.get("/api/worship")
def get_worship(worship: str, date: str):

    html = parse_worship(worship, date)

    return {
        "status": "success",
        "worship": worship,
        "date": date,
        "html": html
    }