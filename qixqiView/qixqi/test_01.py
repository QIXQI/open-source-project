# -*- coding: utf-8 -*-

from flask import Flask, Markup

app = Flask(__name__)
@app.route('/')
def index():
    return Markup('<div>Hello, %s</div>') % '<em>QixQi</em>'
if __name__ == '__main__':
    app.debug = True        # 调试模式
    app.run()