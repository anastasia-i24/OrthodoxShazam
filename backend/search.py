from rapidfuzz import fuzz

def lev_check(text, target):
    """Расстояние Левенштейна — редакционное расстояние между словами"""
    score = 0
    pos = 0
    assert len(text) > len(target)
    for i in range(len(text) - len(target)):
        # делим метрику на 100, т.к. данная метрика находится в пределах от 0 до 100
        current_score = fuzz.ratio(text[i: i + len(target)], target)/100
        if current_score > score:
            score = current_score
            pos = i
    return score, text[pos: pos + len(target)], pos