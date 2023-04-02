package db

import (
	"context"
	"fmt"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func ConnectMongo() *mongo.Client {
	// TODO: ここで環境変数から取得するようにする
	credential := options.Credential{
		Username: os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
	}
	fmt.Println("~~~~~~~~~~~~")
	fmt.Println(os.Getenv("DB_NAME"))
	fmt.Println("~~~~~~~~~~~~")
	clientOptions := options.Client().ApplyURI("mongodb://mongo").SetAuth(credential)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		panic(err)
	} else {
		fmt.Println("Connected to MongoDB!")
	}
	return client
}
