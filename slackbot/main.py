import os
import requests
from slack_bolt import App
from clients.mongodb import MongoDB
from slack_bolt.adapter.flask import SlackRequestHandler

app = App(
  process_before_response=True,
  token=os.environ.get("SLACK_BOT_TOKEN"),
  signing_secret=os.environ.get("SLACK_SIGNING_SECRET")
)

handler = SlackRequestHandler(app)

db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")
db_name = os.environ.get("DB_NAME")
db_port = os.environ.get("DB_PORT")
db_host = os.environ.get("DB_HOST")

@app.event("message")
def monitoring_nutfes_slack(body: dict):
  """ Slackのメッセージを監視する
  Args:
    body (dict): Slackのメッセージ
  """
  mongo = MongoDB(db_host, db_port, db_user , db_password, db_name, "log")
  mongo.insert(body)
  register_channel_name()
  register_user_name()

def register_channel_name():
  """ Slackのチャンネル名を{id:name}として登録する
  """
  url = "https://slack.com/api/conversations.list"
  response = requests.get(url, headers={"Authorization": "Bearer " + os.environ.get("SLACK_BOT_TOKEN")})
  channels = response.json()["channels"]
  replace_channel_dict = {channel["id"]:channel["name"] for channel in channels}

  mongo = MongoDB(db_host, db_port, db_user , db_password, db_name, "channel")
  registered_channel_dict = mongo.find()
  if registered_channel_dict == None:
    mongo.insert(replace_channel_dict)
  mongo.update(registered_channel_dict, replace_channel_dict)


def register_user_name():
  """ Slackのユーザ名を{id:name}として登録する
  """
  url = "https://slack.com/api/users.list"
  response = requests.get(url, headers={"Authorization": "Bearer " + os.environ.get("SLACK_BOT_TOKEN")})
  users = response.json()["members"]
  replace_user_dict = {user["id"]:user["profile"]["display_name"] for user in users}

  mongo = MongoDB(db_host, db_port, db_user , db_password, db_name,"user")
  registered_user_dict = mongo.find()
  if registered_user_dict == None:
    mongo.insert(replace_user_dict)
  mongo.update(registered_user_dict, replace_user_dict)

if __name__ == "__main__":
  app.start(port=int(os.environ.get("PORT", 3000)))
