.PHONY: all build test test-race lint tidy clean

APP_NAME := service
BUILD_DIR := bin

all: lint test-race build

build:
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BUILD_DIR)/$(APP_NAME) ./cmd/$(APP_NAME)

test:
	go test -v ./...

test-race:
	go test -race -v -coverprofile=coverage.out ./...

lint:
	golangci-lint run ./...

tidy:
	go mod tidy
	go mod verify

clean:
	rm -rf $(BUILD_DIR) coverage.out
