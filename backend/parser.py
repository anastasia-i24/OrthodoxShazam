from bs4 import BeautifulSoup
import requests
import re
import unicodedata
import json

URL = 'https://azbyka.ru/worships/'


def find_possible_worships(date: str):
    '''
    Finds all types of worships that happen on the given date
    '''

    params = {'date': date}
    page = requests.get(URL, params=params)

    soup = BeautifulSoup(page.text, "lxml")
    main_box = soup.find_all('div', class_='main-box')
    main_area = main_box[1].find('main', class_='main-area')
    main_area_content = main_area.find('section', class_='main-area-content worship')
    day_settings = main_area_content.find('div', class_='day-settings')
    day_settings_today = day_settings.find('div', class_='day-settings-today')
    bg_worship_type = day_settings_today.find('select', id='bg_worship_type')

    worship_types = []
    values_to_exclude = ['requests', 'chants']
    for option in bg_worship_type.find_all('option'):
        if option.get('value') not in values_to_exclude:
            worship_types.append({
                'value': option.get('value'),
                'title': option.get_text(strip=True)
            })

    return worship_types


def parse_worship(worship: dict, date: str):
    '''
    Returns json file with blocks, html and text 
    of worship of the given type that happens on the given date
    '''
    value = worship['value']
    title = worship['title']

    params = {'worship': value, 'date': date}
    page = requests.get(URL, params=params)

    soup = BeautifulSoup(page.text, "lxml")

    main_box = soup.find_all('div', class_='main-box')
    main_area = main_box[1].find('main', class_='main-area')
    main_area_content = main_area.find('section', class_='main-area-content worship')
    main_page_content = main_area_content.find('div', class_='article-single-content main-page-content')

    if main_page_content is None:
        raise ValueError(
            "Не удалось найти текст богослужения"
        )

    # extracting menu
    worship_menu = main_page_content.find('div', class_='worship_menu')
    if worship_menu:
        worship_menu.decompose()

    for tag in main_page_content.find_all(['em', 'strong', 'summary']):
        tag.decompose()

    fragment_map = {}
    counter = 0

    for tag in main_page_content.find_all('p'):
        text = tag.get_text(strip=True)
        if len(text) < 20:
            continue
        frag_id = f"frag-{counter}"
        counter += 1
        tag['data-fragment-id'] = frag_id
        fragment_map[frag_id] = text

    worship_html = str(main_page_content)
    worship_text = main_page_content.get_text()

    result = {
        'html': worship_html,
        'text': worship_text,
        'fragment_map': fragment_map,
    }

    with open(f'data/texts/{title}_{date}.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)


def normalize_text(text: str):
    KEEP = {"\u0306", "\u0308"} #keep Й and Ё

    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    text = ''.join(
        char for char in text 
        if char in KEEP 
        or unicodedata.category(char) != "Mn"
        and (unicodedata.category(char)[0] in ("L")
        or char.isspace())
    )
    text = unicodedata.normalize("NFC", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text