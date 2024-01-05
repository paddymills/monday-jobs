
import { Job, type JsonFormat } from '@/lib/job.ts';

const PROD_JOB = /(\w)-(\d{7}\w)-(\d{2})/;
const EST_JOB = /E-(\d{2})-(\d{4}\w)-(\d{2})/;

export class FileParser {

	static parseJob(job: string): string {
		let match = PROD_JOB.exec(job);
		if (match) {
			return `${match[1]}-${match[2]}-${match[3]}`;
		}
	
		match = EST_JOB.exec(job);
		if (match) {
			return `D-1${match[1]}${match[2]}-${match[3]}`;
		}
	
		return job;
	}

	static async parseFile(file: File): Promise<Job[]> {
		return await file.text()
			.then((text) => {
				try {
					const parsed: Record<string, JsonFormat> = JSON.parse(text);
					console.log(parsed);
			
					return Object.entries(parsed)
						.map(([key, json]) => new Job(this.parseJob(key), json));
				} catch (err) {
					console.log(err);
					return Promise.reject("Failed to parse file");
				}
			});
		
	}
}
