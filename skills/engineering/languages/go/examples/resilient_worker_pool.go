package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"sync"
	"time"
)

type Task struct {
	ID      string
	Payload int
}

type TaskResult struct {
	ID     string
	Output string
	Err    error
}

// ManagedWorkerPool adheres to the Uber Go rule:
// "Never start a goroutine without knowing how and when it will stop."
type ManagedWorkerPool struct {
	concurrency int
	taskCh      chan Task
	resultCh    chan TaskResult
	stopOnce    sync.Once
	stopCh      chan struct{}
	doneWg      sync.WaitGroup
	handler     func(context.Context, Task) (string, error)
}

func NewManagedWorkerPool(
	concurrency int,
	handler func(context.Context, Task) (string, error),
) *ManagedWorkerPool {
	if concurrency <= 0 {
		concurrency = 1
	}
	return &ManagedWorkerPool{
		concurrency: concurrency,
		taskCh:      make(chan Task),
		resultCh:    make(chan TaskResult),
		stopCh:      make(chan struct{}),
		handler:     handler,
	}
}

// Start launches worker goroutines and records them in the WaitGroup.
func (p *ManagedWorkerPool) Start(ctx context.Context) {
	for i := 0; i < p.concurrency; i++ {
		p.doneWg.Add(1)
		go p.worker(ctx)
	}
}

func (p *ManagedWorkerPool) worker(ctx context.Context) {
	defer p.doneWg.Done()
	for {
		select {
		case <-p.stopCh:
			return
		case <-ctx.Done():
			return
		case task, ok := <-p.taskCh:
			if !ok {
				return
			}
			out, err := p.handler(ctx, task)
			select {
			case <-p.stopCh:
				return
			case <-ctx.Done():
				return
			case p.resultCh <- TaskResult{ID: task.ID, Output: out, Err: err}:
			}
		}
	}
}

// Submit queues a task for processing.
func (p *ManagedWorkerPool) Submit(task Task) bool {
	select {
	case <-p.stopCh:
		return false
	case p.taskCh <- task:
		return true
	}
}

// Results provides read access to the result stream.
func (p *ManagedWorkerPool) Results() <-chan TaskResult {
	return p.resultCh
}

// Stop signals all workers idempotently and blocks until all goroutines exit cleanly.
func (p *ManagedWorkerPool) Stop() {
	p.stopOnce.Do(func() {
		close(p.stopCh)
		p.doneWg.Wait()
		close(p.resultCh)
	})
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	pool := NewManagedWorkerPool(3, func(ctx context.Context, t Task) (string, error) {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		case <-time.After(50 * time.Millisecond):
			return fmt.Sprintf("computed-%d", t.Payload*10), nil
		}
	})

	pool.Start(ctx)

	// Collect results in a coordinated goroutine
	var collectorWg sync.WaitGroup
	collectorWg.Add(1)
	go func() {
		defer collectorWg.Done()
		for res := range pool.Results() {
			if res.Err != nil {
				slog.Warn("task error", slog.String("id", res.ID), slog.Any("error", res.Err))
				continue
			}
			slog.Info("task completed", slog.String("id", res.ID), slog.String("output", res.Output))
		}
	}()

	// Dispatch tasks
	for i := 1; i <= 5; i++ {
		pool.Submit(Task{
			ID:      fmt.Sprintf("task-%d", i),
			Payload: i,
		})
	}

	// Deterministic shutdown: stop pool and wait for collector
	pool.Stop()
	collectorWg.Wait()
	slog.Info("worker pool shut down successfully")
}
