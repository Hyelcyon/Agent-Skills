package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// ServerOption defines the functional option signature for configuring the Server.
type ServerOption func(*Server)

type Server struct {
	addr         string
	readTimeout  time.Duration
	writeTimeout time.Duration
	mux          *http.ServeMux
}

// WithAddr configures the listening address.
func WithAddr(addr string) ServerOption {
	return func(s *Server) {
		s.addr = addr
	}
}

// WithReadTimeout configures the read timeout.
func WithReadTimeout(d time.Duration) ServerOption {
	return func(s *Server) {
		s.readTimeout = d
	}
}

// NewServer initializes a Server using the Functional Options Pattern (Uber Go standard).
func NewServer(opts ...ServerOption) *Server {
	s := &Server{
		addr:         ":8080",
		readTimeout:  5 * time.Second,
		writeTimeout: 10 * time.Second,
		mux:          http.NewServeMux(),
	}
	for _, opt := range opts {
		opt(s)
	}
	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	// Go 1.22+ method matching and path wildcards
	s.mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	s.mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = fmt.Fprintf(w, `{"id":"%s"}`, id)
	})
}

func (s *Server) Run(ctx context.Context) error {
	httpSrv := &http.Server{
		Addr:              s.addr,
		Handler:           s.mux,
		ReadHeaderTimeout: 3 * time.Second,
		ReadTimeout:       s.readTimeout,
		WriteTimeout:      s.writeTimeout,
		IdleTimeout:       60 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		slog.Info("starting server", slog.String("addr", s.addr))
		if err := httpSrv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		return fmt.Errorf("server listener failed: %w", err)
	case <-ctx.Done():
		slog.Info("shutdown signal intercepted; draining connections")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := httpSrv.Shutdown(shutdownCtx); err != nil {
		_ = httpSrv.Close()
		return fmt.Errorf("graceful shutdown failed: %w", err)
	}

	slog.Info("server exited cleanly")
	return nil
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	srv := NewServer(
		WithAddr(":8080"),
		WithReadTimeout(5*time.Second),
	)

	if err := srv.Run(ctx); err != nil {
		slog.Error("server error", slog.Any("error", err))
		os.Exit(1)
	}
}
