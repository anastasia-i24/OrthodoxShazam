from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import subprocess
from datetime import datetime
import json

from transcribe import transcribe
from parser import find_possible_worships, parse_worship, normalize_text
from search import lev_check


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

    # transcribe
    fragment = normalize_text(transcribe(wav_path))

    # parse n' search
    today = datetime.today().strftime('%Y-%m-%d')
    possible_worships = find_possible_worships(today)

    fragments = []
    total_score = 0
    for worship in possible_worships:
        parse_worship(worship, today)

        with open(f"data/texts/{worship['title']}_{today}.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        text = normalize_text(data["text"])
        
        score, founded_fragment, pos = lev_check(text, fragment)
        total_score += score
        fragments.append({
            'date': today,
            'title': worship['title'],
            'text': "..." + founded_fragment + "...",
            'position': pos,
            'score': score
        })

        fragments.sort(key=lambda x: x['score'], reverse=True)

    
    return {
        "status": "success",
        "filename": "recording.wav",
        "transcription": text,
        "fragments": fragments
    }


@app.get("/api/worship")
def get_worship(worship: str, date: str):

    with open(f"data/texts/{worship}_{date}.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    html = data["html"]

    return {
        "status": "success",
        "worship": worship,
        "date": date,
        "html": html
    }