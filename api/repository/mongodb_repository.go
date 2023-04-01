package repository

import (
	"context"
	"log"
	"os"

	"github.com/NUTFes/nutmeg-slack/db"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type mongoDBRepository struct {
	client *mongo.Client
}

type MongoDBRepository interface {
	AllCollection() ([]bson.M, error)
	GetChannelInfo() ([]bson.M, error)
	GetUserInfo() ([]bson.M, error)
}

func NewMongoDBRepository(c *mongo.Client) *mongoDBRepository {
	return &mongoDBRepository{client: c}
}

// 全てのログ情報を取得する
func (mongoDBRepository) AllCollection() ([]bson.M, error) {
	dbName := os.Getenv("DB_NAME")
	client := db.ConnectMongo()
	col, err := client.Database(dbName).Collection("log").Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	var result []bson.M
	if err = col.All(context.Background(), &result); err != nil {
		log.Fatal(err)
	}
	return result, nil
}

// channelのid情報とnameを取得する
func (mongoDBRepository) GetChannelInfo() ([]bson.M, error) {
	dbName := os.Getenv("DB_NAME")
	client := db.ConnectMongo()
	col, err := client.Database(dbName).Collection("channel").Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	var result []bson.M
	if err = col.All(context.Background(), &result); err != nil {
		log.Fatal(err)
	}
	return result, nil
}

// userのid情報とnameを取得する
func (mongoDBRepository) GetUserInfo() ([]bson.M, error) {
	dbName := os.Getenv("DB_NAME")
	client := db.ConnectMongo()
	col, err := client.Database(dbName).Collection("user").Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	var result []bson.M
	if err = col.All(context.Background(), &result); err != nil {
		log.Fatal(err)
	}
	return result, nil
}
