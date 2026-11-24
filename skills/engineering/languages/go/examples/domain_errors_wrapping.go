package main

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
)

var (
	ErrNotFound     = errors.New("entity not found")
	ErrUnauthorized = errors.New("unauthorized action")
)

type FieldViolation struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationError struct {
	Entity     string           `json:"entity"`
	Violations []FieldViolation `json:"violations"`
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation failed on %s: %d violations", e.Entity, len(e.Violations))
}

type AccountService struct{}

// GetAccount demonstrates Google GoTip #1 (Line of Sight) and clean %w error wrapping.
func (s *AccountService) GetAccount(id string) (string, error) {
	if id == "" {
		return "", &ValidationError{
			Entity: "Account",
			Violations: []FieldViolation{
				{Field: "id", Message: "id cannot be empty"},
			},
		}
	}

	if id == "restricted" {
		return "", fmt.Errorf("account %s: %w", id, ErrUnauthorized)
	}

	if id == "missing" {
		return "", fmt.Errorf("account %s: %w", id, ErrNotFound)
	}

	// Happy path continues straight down the left margin
	return fmt.Sprintf("account #%s (active)", id), nil
}

// MapError translates domain errors to HTTP status codes without redundant logging.
func MapError(err error) (int, string) {
	var valErr *ValidationError
	if errors.As(err, &valErr) {
		return http.StatusUnprocessableEntity, valErr.Error()
	}
	if errors.Is(err, ErrNotFound) {
		return http.StatusNotFound, "account not found"
	}
	if errors.Is(err, ErrUnauthorized) {
		return http.StatusForbidden, "access denied"
	}
	return http.StatusInternalServerError, "internal server error"
}

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	service := &AccountService{}

	testIDs := []string{"", "missing", "restricted", "acc-8821"}
	for _, id := range testIDs {
		account, err := service.GetAccount(id)
		if err != nil {
			// Handle errors once: log at the boundary
			status, clientMsg := MapError(err)
			slog.Warn("request rejected",
				slog.String("id", id),
				slog.Int("status", status),
				slog.String("client_msg", clientMsg),
				slog.Any("cause", err),
			)
			continue
		}

		slog.Info("account retrieved", slog.String("account", account))
	}
}
