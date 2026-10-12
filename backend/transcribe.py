import torch
import librosa
from transformers import (
    WhisperProcessor,
    WhisperForConditionalGeneration,
)

MODEL_ID = "bimbo-girl/whisper-small-church-slavonic"

device = "cuda" if torch.cuda.is_available() else "cpu"

processor = WhisperProcessor.from_pretrained(MODEL_ID)

model = WhisperForConditionalGeneration.from_pretrained(
    MODEL_ID
).to(device)

model.eval()


def transcribe(audio_path: str) -> str:

    audio, _ = librosa.load(
        audio_path,
        sr=16000,
        mono=True,
    )

    if len(audio) == 0:
        raise ValueError("Аудиофайл пустой")

    inputs = processor(
        audio,
        sampling_rate=16000,
        return_tensors="pt",
    )

    input_features = inputs.input_features.to(device)

    with torch.inference_mode():
        predicted_ids = model.generate(
            input_features,
            max_new_tokens=225,
        )

    result = processor.batch_decode(
        predicted_ids,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False,
    )[0]

    return result.strip()