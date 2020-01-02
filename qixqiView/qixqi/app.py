#-*- coding: utf-8 -*-
from flask import Flask, render_template, make_response
import json
import os


app = Flask(__name__)

APP_ROOT = os.path.dirname(os.path.abspath(__file__))
QidianSpider_static_path = os.path.join(APP_ROOT, '../../QidianSpider')     # 爬去到的json文件信息目录


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/getBook')
def getBook():
    # print('-'*100)
    # print(QidianSpider_static_path)
    # print(type(QidianSpider_static_path))
    # print('-'*100)
    rst = make_response('{}')
    with open(os.path.join(QidianSpider_static_path, 'ebook.json'), 'r') as fp:
        dataDict = json.load(fp)
        dataStr = json.dumps(dataDict, ensure_ascii=False)
        print(dataStr)
        # return dataStr
        rst = make_response(dataStr)
    rst.headers['Access-Control-Allow-Origin'] = '*'
    return rst
    


@app.route('/error')
def error():
    return render_template('error.html')


if __name__ == '__main__':
    app.run(debug=True)



