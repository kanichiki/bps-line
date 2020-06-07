from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
)

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
    return "hello"

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0',port=8000)

    