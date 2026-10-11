from rapidfuzz import fuzz
from parser import normalize_text

def find_best_fragment(target_norm: str, fragment_map: dict):
    best_score = 0.0
    best_id = None

    for frag_id, block_text in fragment_map.items():
        block_norm = normalize_text(block_text)
        if not block_norm:
            continue
        score = fuzz.partial_ratio(block_norm, target_norm) / 100
        if score > best_score:
            best_score = score
            best_id = frag_id

    return best_score, best_id