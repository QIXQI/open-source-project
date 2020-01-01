
import requests, time, re, pprint
from fontTools.ttLib import TTFont
from io import BytesIO



def get_font(url):
    
    time.sleep(1)
    response = requests.get(url)
    font = TTFont(BytesIO(response.content))
    web_font_relation = font.getBestCmap()
    font.close()
    return web_font_relation


python_font_relation = {
    'one':1,
    'two':2,
    'three':3,
    'four':4,
    'five':5,
    'six':6,
    'seven':7,
    'eight':8,
    'nine':9,
    'zero':0,
    'period':'.'
}

def get_html_info(url):

    headers = {
        'User-Agent': 'User-Agent:Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
    }
    html_data = requests.get(url, headers=headers)
    # 获取网页的文字ttf文件的地址
    url_ttf_pattern = re.compile('<style>(.*?)\s*</style>',re.S)
    fonturl = re.findall(url_ttf_pattern,html_data.text)[0]
    url_ttf = re.search('woff.*?url.*?\'(.+?)\'.*?truetype', fonturl).group(1)

    # 获取所有反爬的数字
    word_pattern = re.compile('</style><span.*?>(.*?)</span>', re.S)#制定正则匹配规则，匹配所有<span>标签中的内容
    numberlist = re.findall(word_pattern, html_data.text)

    return url_ttf,numberlist


def get_encode_font(numberlist,web_font_relation):
   
    data = []
    for i in numberlist:
        fanpa_data = ''
        index_i = numberlist.index(i)
        words = i.split(';')
        #print('words:',words)
        for k in range(0,len(words)-1):
            words[k] = words[k].strip('&#')
            #print(words[k])
            words[k] = str(python_font_relation[web_font_relation[int(words[k])]])
            #print(words[k])
            fanpa_data += words[k]
        #print(fanpa_data)
        data.append(fanpa_data)
    return data[3]
   # return data

"""返回周推荐票数"""
"""程序主入口"""
def getRecomments(url):
    get_html_info(url)
    web_font_relation = get_font(get_html_info(url)[0])
    recomments=get_encode_font(get_html_info(url)[1],web_font_relation)
    recomments=float(recomments)
    if recomments>20:
        recomments=float(recomments)/10000.0
    return recomments

