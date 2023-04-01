package usecase

import (
	"github.com/NUTFes/relation-slack/repository"
	"github.com/NUTFes/relation-slack/usecase/util"
	"go.mongodb.org/mongo-driver/bson"
)

type mongoDBUsecase struct {
	repository repository.MongoDBRepository
}

type MongoDBUsecase interface {
	GetAllCollection() []bson.M
	GetChannel() []string
	FetchData() []map[string]string
	GroupDataByChannel() [][]map[string]string
	GetChannelInfo() []bson.M
	GetUserInfo() []bson.M
}

func NewMongoDBUsecase(r repository.MongoDBRepository) *mongoDBUsecase {
	return &mongoDBUsecase{repository: r}
}

func (u *mongoDBUsecase) GetAllCollection() (docs []bson.M) {
	docs, err := u.repository.AllCollection()
	if err != nil {
		panic(err)
	}
	return docs
}

// DBに保存されているchannelを取得する
func (u *mongoDBUsecase) GetChannel() []string {
	docs, err := u.repository.AllCollection()
	channelsInfoMap, err := u.repository.GetChannelInfo()
	channelsInfo := channelsInfoMap[0]
	var channelSlice []string
	for _, v := range docs {
		channel := v["event"].(bson.M)["channel"].(string)
		channelName := channelsInfo[channel].(string)
		if util.Iscontains(channelSlice, channelName) == false {
			channelSlice = append(channelSlice, channelName)
		}
	}
	if err != nil {
		panic(err)
	}
	return channelSlice
}

// user, text, channel, event_ts, thread_tsを取得する
func (u *mongoDBUsecase) FetchData() []map[string]string {
	docs, err := u.repository.AllCollection()
	usersInfoMap, err := u.repository.GetUserInfo()
	channelsInfoMap, err := u.repository.GetChannelInfo()

	usersInfo := usersInfoMap[0]
	channelsInfo := channelsInfoMap[0]
	var data []map[string]string

	for _, v := range docs {
		var m = make(map[string]string)
		eventTs := v["event"].(bson.M)["event_ts"].(string)
		channel := v["event"].(bson.M)["channel"].(string)
		text := v["event"].(bson.M)["text"]
		threadTs := v["event"].(bson.M)["thread_ts"]
		user := v["event"].(bson.M)["user"]

		m["eventTs"] = eventTs

		channelName := channelsInfo[channel]
		m["channelName"] = channelName.(string)
		m["channelId"] = channel

		if threadTs != nil {
			m["threadTs"] = threadTs.(string)
		}

		if text != nil {
			m["text"] = text.(string)
		}

		if user != nil {
			userName := usersInfo[user.(string)]
			m["user"] = userName.(string)
		}

		data = append(data, m)
	}
	if err != nil {
		panic(err)
	}
	return data
}

// チャンネルごとにデータをまとめる
func (u *mongoDBUsecase) GroupDataByChannel() [][]map[string]string {
	channel := u.GetChannel()
	data := u.FetchData()
	var groupData [][]map[string]string
	// チャンネルごとに1配列に格納する
	for _, c := range channel {
		var m []map[string]string
		for _, d := range data {
			if d["channelName"] == c {
				m = append(m, d)
			}
		}
		groupData = append(groupData, m)
	}
	return groupData
}

// channelの情報を取得する{channel_id: channel_name}
func (u *mongoDBUsecase) GetChannelInfo() (docs []bson.M) {
	docs, err := u.repository.GetChannelInfo()
	if err != nil {
		panic(err)
	}
	return docs
}

// userの情報を取得する{user_id: user_name}
func (u *mongoDBUsecase) GetUserInfo() (docs []bson.M) {
	docs, err := u.repository.GetUserInfo()
	if err != nil {
		panic(err)
	}
	return docs
}
