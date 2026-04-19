package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"app":       "{{PROJECT_NAME}}",
			"framework": "gin",
			"db":        "{{DB}}",
			"message":   "Hello from Polystack!",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	_ = r.Run(":8080")
}
