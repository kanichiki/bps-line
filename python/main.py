from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
)

import flask
from flask import Flask, request, abort
import os
from os.path import join,dirname
from dotenv import load_dotenv
import json

from rollcall import rollcall

load_dotenv(verbose=True)

dotenv_path = join(dirname(__file__),'.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
LINE_CHANNEL_ACCESS_TOKEN = os.environ.get("channelAccessToken")
LINE_CHANNEL_SECRET = os.environ.get("channelSecret")
line_bot_api = LineBotApi(LINE_CHANNEL_ACCESS_TOKEN)
handler = WebhookHandler(LINE_CHANNEL_SECRET)


@app.route('/rollcall',methods=["POST"])
def index():
    data = request.data.decode('utf-8')
    data = json.loads(data)
    display_names = rollcall(data["pl_id"])
    display_names = 'さん、\n'.join(display_names)
    reply = '参加受付を終了します\n\n参加者は\n\n%sさん\n\nです！' % display_names

    line_bot_api.reply_message(str(data["replyToken"]),TextSendMessage(text=reply))
    return flask.redirect(flask.url_for("night"))

# 夜（能力行使。ただし、初日は人狼による襲撃はない）
@app.route('/night')
def night() -> None:
    data = request.data.decode('utf-8')
    data = json.loads(data)
    reply = '夜になりました。みなさん'

    line_bot_api.reply_message(str(data["replyToken"]),TextSendMessage(text=reply))
    
# 朝（襲撃の結果表示 -> 話し合い）
@app.route('/morning')
def night() -> None:
    data = request.data.decode('utf-8')
    data = json.loads(data)
    reply = '朝になりました。昨晩の犠牲者はあゆむさんです。話し合ってください。'

    line_bot_api.reply_message(str(data["replyToken"]),TextSendMessage(text=reply))

# 昼（投票）
@app.route('/noon')
def night() -> None:
    data = request.data.decode('utf-8')
    data = json.loads(data)
    reply = '昼になりました。みなさん投票してください。'

    line_bot_api.reply_message(str(data["replyToken"]),TextSendMessage(text=reply))

# 夕方（処刑）
@app.route('/evening')
def night() -> None:
    data = request.data.decode('utf-8')
    data = json.loads(data)
    reply = '夕方になりました。処刑される人はあゆむさんです'

    line_bot_api.reply_message(str(data["replyToken"]),TextSendMessage(text=reply))


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0',port=8000)

    