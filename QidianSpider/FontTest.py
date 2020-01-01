"""
起点中文网，在“数字”上设置了文字反爬，使用了自定义的文字文件ttf
浏览器渲染不出来，但是可以在网页源代码中找到映射后的数字
正则爬的是网页源代码 xpath是默认utf-8解析网页数据;网页源代码有数据，使用浏览器"检查"是方框，用xpath爬出来的也是方框
以小说《斗罗大陆》为例 https://book.qidian.com/info/1115277
"""
import requests, time, re, pprint
from fontTools.ttLib import TTFont
from io import BytesIO

#此代码使用bs和xpath均无法爬出，需使用正则匹配
#selector = etree.HTML(html_data.text)
#word1 = selector.xpath('//div[2]/div[6]/div[1]/div[2]/p[3]/em[1]/span/text()')

def get_font(url):
    """
    获取源代码中数字信息与英文单词之间的映射关系
    :param url: <str> 网页源代码中的字体地址
    :return: <dict> 网页字体映射关系
    """
    time.sleep(1)
    response = requests.get(url)
    font = TTFont(BytesIO(response.content))
    web_font_relation = font.getBestCmap()
    font.close()
    return web_font_relation


#在fontcreator中查看此ttf文件中英文单词与阿拉伯数字的映射关系，写入字典
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
    """
    解析网页，获取文字文件的地址和需要解码的数字信息
    :param url: <str> 需要解析的网页地址
    :return:    <str> 文字文件ttf的地址
                <list> 反爬的数字，一维列表
    """
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
    """
    把源代码中的数字信息进行2次解码
    :param numberlist: <list> 需要解码的一维数字信息
    :return:
    """
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

