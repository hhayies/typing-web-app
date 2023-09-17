from time import sleep

from bs4 import BeautifulSoup
import requests
import pandas as pd
import re
import pykakasi

# urlの取得 (複数のurlを取得しやすいようにページ数を変数にする)
url = "https://yattoke.com/2017/11/22/kotowaza120/{}/"
# ことわざを辞書型で格納するリスト
kotowaza_list = []

# 4ページ文をループで回す
for i in range(1, 5):

    # ページ数指定
    tango_url = url.format(i)
    res = requests.get(tango_url)

    # サーバーに負荷をかけないようにするため１秒休止
    sleep(1)

    soup = BeautifulSoup(res.text, "html.parser")

    contents = soup.find("div", class_="entry-content")

    # ことわざの取得
    tango = contents.find_all("h3")
    # 先頭の余分な文字を削除
    kotowaza = [re.sub(r'[0-9]*.\s+', "", x.text) for x in tango]

    # 読みがなの取得
    yomigana = [x.neif xt_sibling for x in tango]
    # 余分な空白を削除
    yomi = [re.sub(r"\s*", "", x.text) for x in yomigana]

    #ひらがなをローマ字変換
    kakasi = pykakasi.kakasi()          # インスタンス生成
    kakasi.setMode("H", "a")            # ローマ字に変換
    conversion = kakasi.getConverter()  # 上記モードの適用
    romaji = [conversion.do(x) for x in yomi]

    # リストに追加する
    for (x, y, z) in zip(kotowaza, yomi, romaji):
        dict = {
            "kotowaza":x,
            "yomigana":y,
            "romaji":z
        }
        kotowaza_list.append(dict)

"""" リストのデータをcsvに保存する"""

# データフレーム(表形式)を作成する
df = pd.DataFrame(kotowaza_list)

# csvに出力する
df.to_csv("tango.csv", index=None, encoding="utf-8-sig")
