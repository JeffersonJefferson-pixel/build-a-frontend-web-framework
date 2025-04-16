// flag to indicate wheter the process jobs function is schedules
let isScheduled = false
const jobs = []

export function enqueueJob(job) {
    // push job to jobs queue
    jobs.push(job)
    scheduleUpdate()
}

function scheduleUpdate() {
    if (isScheduled) return

    isScheduled = true
    // queue a microtask to run process jobs function
    queueMicrotask(processJobs)
}

function processJobs() {
    while (jobs.length > 0) {
        // pop job from jobs queue and execute function.
        const job = jobs.shift()
        const result = job()

        Promise.resolve(result).then(
            () => {
                // job completes successfully
            },
            (error) => {
                console.error(`[scheduler]: ${error}`)
            }
        )
    }

    isScheduled = false
}

export function nextTick() {
    scheduleUpdate()
    // schedule a task whose callback resolve a promise.
    // this make sure resolve only promise returned by nextTick() function when all jobs in scheduler finish executing.
    return flushPromises()
} 

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve))
}