import requests
from bs4 import BeautifulSoup
import json
import re

def get_url():
    url = "https://alcooldiscount.ro/ro/gin"
    response = requests.get(url)
    soup = BeautifulSoup(response.text,"lxml")
    result = soup.find(id="nb_item_bottom") 
    return url + "?n=" + result['value']


def get_data():
    gin_list = []
    url = get_url()
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "lxml")
    data = soup.findAll("div", class_="product-container")
    for item in data:
        string =item.find("a", class_="product-name").text.strip()
        name_string = re.match(r"(.+)\s(\d{2}\.?\d?%).+\s(\d{1}\.?\d{0,2}L)", string)
        name = name_string[1].strip().replace(",","") + " " + name_string[3]
        name = name.upper().replace("GIN ", "")
        alcohol = name_string[2]
        litrage = name_string[3]
        price = float(item.find("span", class_="price").text.strip().strip(" lei").replace(",","."))
        gin = { "name": name, "alcohol": alcohol, "litrage": litrage, "price": price}
        gin_list.append(gin)
    return gin_list


with open("alcooldiscount.json", "w") as f:
    my_list = get_data()
    json_data = json.dumps(my_list)
    f.write(json_data);

