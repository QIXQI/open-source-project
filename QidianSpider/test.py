# -*- coding: utf-8 -*-
import csv
import json

with open('QidianSpider/ebook.csv', 'r') as f:

    # reader = csv.reader(f)
    # print(type(reader))
    # result = list(reader)
    # print(result)

    reader = csv.reader(f)
    keyNames = next(reader)
    # print(keyNames)
    dict_reader = csv.DictReader(f, fieldnames = keyNames)    # self._keyNames = keyNames
    for row in dict_reader:
        # print(row)
        print(dict(row))


     

    # csv 转 json
    # print(json.dumps(result, ensure_ascii=False))


print('-'*100)

with open('QidianSpider/ebook.json', 'r') as fp:
    json_str = json.load(fp)
    print(type(json_str))
    print(json_str)
    json_str = json.dumps(json_str, ensure_ascii=False)
    print(type(json_str))
    print(json_str)

    # json.dump(data, fp)
    # print(data)
    # print(type(data))


print('-'*100)

data = {
    'name': '斗罗大陆',
    'rating': 8.8
}
print(type(data))
print(data)
data1 = json.dumps(data, ensure_ascii=False)
print(type(data1))
print(data1)