package main

import (
	"fmt"
	"sync"
	"time"
)

type Job func(workerNum int)

type Pool struct {
	workQueue chan Job
	wg        sync.WaitGroup
}

func NewPool(workerCount int) *Pool {
	pool := &Pool{
		workQueue: make(chan Job),
	}

	pool.wg.Add(workerCount)
	for i := 0; i < workerCount; i++ {
		workerNum := i
		go func() {
			defer pool.wg.Done()
			for job := range pool.workQueue {
				job(workerNum)
			}
		}()
	}
	return pool
}

func (p *Pool) AddJob(job Job) {
	p.workQueue <- job
}

func (p *Pool) Wait() {
	close(p.workQueue)
	p.wg.Wait()
}

func main() {
	pool := NewPool(10)

	for i := 0; i < 100; i++ {
		jobNumber := i
		job := func(workerNum int) {
			time.Sleep(1 * time.Second)
			fmt.Println("Job ", jobNumber, " completed by", workerNum)
		}
		pool.AddJob(job)
	}

	pool.Wait()
}
