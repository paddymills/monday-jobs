import { type Job } from "@/lib/job";
import { ApiService } from "./Base";

function delayedResolve(delay?: number): Promise<void> {
    if ( delay === undefined ) {
        // Random time between 250ms and 5s
        delay = Math.pow(Math.floor(Math.random() * 8), 4) * Math.random() * 2 - 0.5;
    }

    return new Promise((r) => { setTimeout(() => { r(); }, delay); });
}

export class OfflineService extends ApiService {
    initJobs = (): Promise<any> => delayedResolve(500);
    updateJob = (job: Job): Promise<any> => delayedResolve();

    error = (text: string): void => console.log(text);
}
