package main

import (
	"fmt"
	"math/rand"
	"sync"
)

type Job func(workerNum int)

type Pool struct {
	workQueue  chan Job
	wg         sync.WaitGroup
	workerJobs map[int][]int
	mutex      sync.Mutex
}

func NewPool(workerCount int) *Pool {
	pool := &Pool{
		workQueue:  make(chan Job),
		workerJobs: make(map[int][]int),
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

func (p *Pool) AddWorkerTask(workerNum int, jobNumber int) {
	p.mutex.Lock()
	defer p.mutex.Unlock()
	p.workerJobs[workerNum] = append(p.workerJobs[workerNum], jobNumber)
}

func (p *Pool) GetWorkerTasks(workerNum int) []int {
	p.mutex.Lock()
	defer p.mutex.Unlock()
	return p.workerJobs[workerNum]
}

func main() {
	pool := NewPool(10)

	for i := 0; i < 100; i++ {
		jobNumber := i
		job := func(workerNum int) {
			random := rand.Intn(100) * jobNumber
			for i := 0; i < random; i++ {
				// do nothing just for time consuming
			}

			pool.AddWorkerTask(workerNum, jobNumber)
		}
		pool.AddJob(job)
	}

	pool.Wait()

	for worker := 0; worker < 10; worker++ {
		tasks := pool.GetWorkerTasks(worker)
		fmt.Println("Worker", worker, "completed", len(tasks), "%", "tasks and they are", tasks)
	}

}
