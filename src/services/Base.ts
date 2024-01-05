
import type { Job } from "@/lib/job";

abstract class ApiService {
    abstract initJobs(): Promise<any>;
	abstract updateJob(job: Job): Promise<any>;

    abstract error(text: string): void;
}

export { ApiService };
