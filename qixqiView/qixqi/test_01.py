# 测试用例1

from flask import Flask

app = Flask(__name__)
@app.route('/')
def index():
    return 'Hello World'
if __name__ == '__main__':
    app.debug = True        # 调试模式
    app.run()