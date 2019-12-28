# coding:utf-8
 
from flask import Flask, make_response, request
import time
 
 
app = Flask(__name__)

# 设置cookie
@app.route("/set_cookie")
def set_cookie():
    resp = make_response("success")  # "success"是响应体
    # 设置cookie, 默认有效期是临时cookie，浏览器关闭就失效
    resp.set_cookie("Name", "Python")
    resp.set_cookie("login_time", time.strftime("%Y-%m-%d %H:%M:%S"))
    # max_age设置有效期，单位：秒
    resp.set_cookie("Name2", "Python1", max_age=3600)
    # 设置cookie其实就是通过设置响应头实现的。
    # resp.headers["Set-Cookie"] = "Name3=Python3; Expires=Sat, 18-Nov-2017 04:36:04 GMT; Max-Age=3600; Path=/"
    return resp
 
 
# 获取cookie
@app.route("/get_cookie")
def get_cookie():
    c = request.cookies.get("Name")
    return c
 
 
# 删除cookie
@app.route("/delete_cookie")
def delete_cookie():
    resp = make_response("del success")
    # 删除cookie
    resp.delete_cookie("Name")
    resp.delete_cookie("Name1")
    resp.delete_cookie("Name2")
    resp.delete_cookie("login_time")
    return resp
 
 
if __name__ == '__main__':
    app.run(debug=True)
 

