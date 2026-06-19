from bs4 import BeautifulSoup
import requests
from datetime import datetime


today_date = datetime.today().strftime("%D-%m-%Y/")
url = 'https://xn--80adfddrquddgz.xn--p1ai/posledovaniya/2026/' + today_date
page = requests.get(url)

soup = BeautifulSoup(page.text, "html.parser")

bullets = soup.findAll('li', class_='normal')
services = []

print(soup)