# -*- coding: utf-8 -*-

def test():
    response = None
    print(id(response))
    if 2 > 1:
        response = 'hello'
        print(id(response))

    print(response)

test()