package main

import (
	"log"
	"net/http"

	"github.com/NUTFes/nutmeg-slack/controller"
	"github.com/NUTFes/nutmeg-slack/db"
	"github.com/NUTFes/nutmeg-slack/repository"
	"github.com/NUTFes/nutmeg-slack/usecase"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	loadEnv()
	client := db.ConnectMongo()
	repository := repository.NewMongoDBRepository(client)
	usecase := usecase.NewMongoDBUsecase(repository)
	controller := controller.NewMongoDBController(usecase)

	e.GET("/documents", controller.IndexDocument)
	e.GET("/channel", controller.IndexChannel)
	e.GET("/data", controller.IndexData)
	e.GET("/group/channel", controller.IndexGroupByChannel)
	e.GET("/channel/info", controller.IndexChannelInfo)
	e.GET("/users/info", controller.IndexUserInfo)

	// CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		// TODO: 本番環境のURLも許可する
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
	}))
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Logger.Fatal(e.Start(":1323"))
}

// 環境変数を読み込む
func loadEnv() {
	err := godotenv.Load("env/.env")
	if err != nil {
		log.Fatal(err)
	}
}
