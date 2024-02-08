import {v4 as uuidv4} from 'uuid';

type PoolTask = () => Promise<void>;
export type TaskID = string;

interface PoolQueueItem {
    id: TaskID;
    item: PoolTask;
}

export class PromisePool {
    private queue: PoolQueueItem[] = [];
    private readonly concurrency: number;
    private running: number = 0;

    constructor(concurrency: number = 3) {
        this.concurrency = concurrency;
    }

    submit(task: PoolTask) {
        const id = uuidv4();
        this.queue.push({id, item: task});
        this.pollTask();
        return id;
    }

    cancel(id: TaskID) {
        this.queue = this.queue.filter(item => item.id !== id);
    }

    private pollTask() {
        if (this.running >= this.concurrency) return;
        const task = this.queue.shift();
        if (task === undefined) return;

        this.running += 1;
        task.item().catch((err) => {
            console.error('UploadPool:', err);
        }).finally(() => {
            this.notifyCompletion();
        });
    }

    private notifyCompletion() {
        this.running -= 1;
        this.pollTask();
    }
}
