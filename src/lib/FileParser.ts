import { MondayService } from '$lib/services/MondayService.ts';

// TODO: add `Public Prefab Date` as a fallback for Main start if it does not exist

// TODO: add structure letter to parse
// TODO: can now hard code `D-` for jobs
const PROD_JOB = /(\w)-(\d{7})\w-(\d{2})/;
const EST_JOB = /E-(\d{2})-(\d{4})\w-(\d{2})/;

const JOB_INDEX = 1;

const COST_CENTERS = {
	'2005': 'WB',
	'2006': 'NB',
	'2007': 'SB',
	'2030': 'MBN',
	'2031': 'MBS'
};

enum JobProperty {
	Pm,
	Products,
	Bays,
	EarlyStart,
	MainStart,
}

class Job {
	mondayId: number = -1;
	name: string;
	pm: string = "";
	products: [string?] = [];
	bays: [string?] = [];
	earlyStart: Date;
	mainStart: Date;

	constructor(job: string) {
		this.name = job;

		this.earlyStart = new Date();
		this.mainStart = new Date();
	}

	update(prop: JobProperty, value: string) {
		switch (prop) {
			case JobProperty.Pm:
				this.pm = value;
				break;
			case JobProperty.Products:
				this.products.push(value);
				break;
			case JobProperty.Bays:
				this.bays.push(value)
				break;
			case JobProperty.EarlyStart:
				this.earlyStart = new Date(value);
				break;
			case JobProperty.MainStart:
				this.mainStart = new Date(value);
				break;
		
			default:
				break;
		}
	}
}

export class FileParser {
	jobs: Record<string, Job>;

	constructor() {
		this.jobs = {};

		// update job method
		this.jobs.updateJob = (job, prop, val) => {
			if (!this.jobs.hasOwnProperty(job)) {
				return;
			}

			if (val === '' || val === null) {
				return;
			}

			if (this.jobs[job].hasOwnProperty(prop)) {
				val = this.jobs[job][prop] + ',' + val;
			}

			if (this.jobs.jobNumbers.indexOf(job) === -1) {
				this.jobs.jobNumbers.push(job);
			}

			this.jobs[job][prop] = val;
		};

		// job exists
		this.jobs.exists = (job) => {
			if (this.jobs.hasOwnProperty(job)) {
				return true;
			}

			return false;
		};

		return this;
	}

	initConfig(state) {
		this.cfg = state;

		return this;
	}

	async initJobs() {
		return MondayService.getJobs(this.cfg.boardId).then((res) => {
			Object.assign(this.jobs, res);

			return this;
		});
	}

	async parseFile(file) {
		const text = await file.text();

		text
			.split('\r\n') // split text into lines
			.map(parseLine) // split lines into array and parse job
			.filter((x) => this.jobs.exists(x[JOB_INDEX]))
			.forEach((line) => {
				let job = line[JOB_INDEX];

				const type = line[0];
				if (type === 'Dates') {
					this.jobs.updateJob(job, this.cfg.earlyStartColumn, formatDate(line[2]));
					this.jobs.updateJob(job, this.cfg.mainStartColumn, formatDate(line[3]));
				} else if (type === 'PM') {
					this.jobs.updateJob(job, this.cfg.pmColumn, line[2]);
				} else if (type === 'Products') {
					this.jobs.updateJob(job, this.cfg.productsColumn, line[2]);
				} else if (type === 'Bays') {
					if (COST_CENTERS.hasOwnProperty(line[2])) {
						this.jobs.updateJob(job, this.cfg.baysColumn, COST_CENTERS[line[2]]);
					}
				} else {
					console.log('Type not matched: ', line);
				}
			});

		return this.jobs.map((key) => {
			return { job: key, vals: this.jobs[key] };
		});
	}
}

function parseLine(line: string): string[] {
	const arr = line.split(',');

	arr[JOB_INDEX] = parseJob(arr[JOB_INDEX]);

	return arr;
}

function parseJob(job: string): string {
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

function formatDate(date: string): string {
	return new Date(date).toISOString().substring(0, 10);
}
