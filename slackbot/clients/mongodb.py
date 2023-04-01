from pymongo import MongoClient

class MongoDB:
  def __init__(self, host, port, user, password, db_name, collection_name):
    """ コンストラクタ
    Args:
      host (str): ホスト名
      port (int): ポート番号
      user (str): ユーザー名
      password (str): パスワード
      db_name (str): DB名
      collection_name (str): コレクション名
    """
    self.client = MongoClient(f"mongodb://{user}:{password}@{host}:{port}")
    self.db = self.client[db_name]
    self.collection = self.db[collection_name]

  ## https://pymongo.readthedocs.io/en/stable/api/pymongo/collection.html#pymongo.collection.Collection.update_one
  def insert(self, data:dict):
    """ DBにデータを挿入する
      Args:
        data (dict): 挿入するデータ
    """
    self.collection.insert_one(data)

  def update(self, mapping:dict, replace:dict):
    """ DBのデータを更新する
      Args:
        data (dict): 更新するdata
    """
    self.collection.replace_one(mapping, replace)

  def find(self)->dict:
    """DBのデータを先頭1件取得する
    Returns:
      dict: 取得したデータ
    """
    return self.collection.find_one({})
