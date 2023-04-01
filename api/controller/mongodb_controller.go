package controller

import (
	"net/http"

	"github.com/NUTFes/relation-slack/usecase"
	"github.com/labstack/echo/v4"
)

type mongoDBController struct {
	usecase usecase.MongoDBUsecase
}

type MongoDBController interface {
	IndexDocument(ctx echo.Context) error
	IndexChannel(ctx echo.Context) error
	IndexData(ctx echo.Context) error
	IndexGroupByChannel(ctx echo.Context) error
	IndexChannelInfo(ctx echo.Context) error
	IndexUserInfo(ctx echo.Context) error
}

func NewMongoDBController(u usecase.MongoDBUsecase) *mongoDBController {
	return &mongoDBController{usecase: u}
}

func (c *mongoDBController) IndexDocument(ctx echo.Context) error {
	doc := c.usecase.GetAllCollection()
	return ctx.JSON(http.StatusOK, doc)
}

func (c *mongoDBController) IndexChannel(ctx echo.Context) error {
	channel := c.usecase.GetChannel()
	return ctx.JSON(http.StatusOK, channel)
}

func (c *mongoDBController) IndexData(ctx echo.Context) error {
	user := c.usecase.FetchData()
	return ctx.JSON(http.StatusOK, user)
}

func (c *mongoDBController) IndexGroupByChannel(ctx echo.Context) error {
	user := c.usecase.GroupDataByChannel()
	return ctx.JSON(http.StatusOK, user)
}

func (c *mongoDBController) IndexChannelInfo(ctx echo.Context) error {
	channelInfo := c.usecase.GetChannelInfo()
	return ctx.JSON(http.StatusOK, channelInfo)
}

func (c *mongoDBController) IndexUserInfo(ctx echo.Context) error {
	channelUser := c.usecase.GetUserInfo()
	return ctx.JSON(http.StatusOK, channelUser)
}
