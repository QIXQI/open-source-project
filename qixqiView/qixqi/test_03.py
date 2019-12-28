# -*- coding: utf-8 -*-
from flask import Flask, url_for, request, render_template, redirect, session, make_response
import time

app = Flask(__name__)

# 登录
@app.route('/login', methods=['POST', 'GET'])
def login():
    response = None
    if request.method == 'POST':
        if request.form['user'] == 'admin':     # request.form.get('user') 可以避免KeyError
            session['user'] = request.form['user']
            response = make_response('You login successfully')
            # response.set_cookie('login_time', time.strftime('%Y-%m-%d %H:%M:%S'))     # 失败，这里cookie写入不进去
        else:
            return 'No such user!'

    if 'user' in session:
        login_time = request.cookies.get('login_time')
        print(request.cookies)
        print(login_time)
        response = make_response('Hello %s, you logged in on %s' % (session['user'], login_time))
    else:
        title = request.args.get('title', 'Default')        # get请求
        # 构建响应
        response = make_response(render_template('login.html', title=title), 200)
        response.headers['key'] = 'value'

    response.set_cookie('login_time', time.strftime('%Y-%m-%d %H:%M:%S'))
    # response.delete_cookie('last_time')
    return response


# 登出
@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))


# 密钥
app.secret_key = 'qixqi'

if __name__ == '__main__':
    app.run(debug=True)