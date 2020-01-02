import json
import requests
import threading
import time
from bs4 import BeautifulSoup
from FontTest import getRecomments
url_list=['https://www.qidian.com/all?chanId=21&orderId=&page=1&style=1&pageSize=20&siteid=1&pubflag=0&hiddenField=0',
           'https://www.qidian.com/all?chanId=21&orderId=&style=1&pageSize=20&siteid=1&pubflag=0&hiddenField=0&page=2',
           'https://www.qidian.com/all?chanId=21&orderId=&style=1&pageSize=20&siteid=1&pubflag=0&hiddenField=0&page=3'
          ]
name_list=[]
id_list=[]
score_list=[]
num_list=[]
recomment_list=[None]*60
dic=[]
threads=[]

def getBookId(url):
    result=requests.get(url)
    soup=BeautifulSoup(result.text,"html.parser")
    div_list=soup.find_all(class_='book-mid-info')
    for div in div_list:
        name_list.append(div.h4.a.text)
        id_list.append(div.h4.a.get("data-bid"))

def replaceId(id):
    return 'https://book.qidian.com/ajax/comment/index?_csrfToken=MzswhxVTI5dSsUZ3aIc3g1qzH4qX8c876Sec2WeH&bookId='+str(id)+'&pageSize=15'

def getXHRData(url):
    r=requests.get(url)
    dic=eval(r.text)
    score_list.append(dic['data']['rate'])
    num_list.append(dic['data']['userCount'])

def getScore():
    for count in range(60):
        url=replaceId(id_list[count])
        getXHRData(url)

def getRe(count):
    while(True):
        try:
            url='https://book.qidian.com/info/'+id_list[count]
            x=getRecomments(url)
            recomment_list[count]=x
            print(str(count)+"成功")
            break
        except:
            time.sleep(1)
            print(str(count)+"失败")
            continue
for url in url_list:
    getBookId(url)

getScore()
for i in range(60):
    t1=threading.Thread(target=getRe,args=(i,))
    threads.append(t1)
    t1.start()
for t in threads:
    t.join()
for i in range(60):
    dic.append({"name":name_list[i],"rating":score_list[i],"user_count":num_list[i],"week_recommend":recomment_list[i]})
json_str=json.dumps(dic,ensure_ascii=False,sort_keys=True, indent=4)
with open('ebook.json','w') as fp:
    fp.write(json_str)