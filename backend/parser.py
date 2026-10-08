from bs4 import BeautifulSoup
import requests

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


def parse_worship(worship: str, date: str):
    '''
    Returns html of worship of the given type that happens on the given day
    '''

    params = {'worship': worship, 'date': date}
    page = requests.get(URL, params=params)

    soup = BeautifulSoup(page.text, "lxml")

    main_box = soup.find_all('div', class_='main-box')
    main_area = main_box[1].find('main', class_='main-area')
    main_area_content = main_area.find('section', class_='main-area-content worship')
    worship_html = main_area_content.find('div', class_='article-single-content main-page-content')

    if worship_html is None:
        raise ValueError(
            "Не удалось найти текст богослужения"
        )

    return str(worship_html)
