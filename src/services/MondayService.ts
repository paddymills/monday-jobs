import type { Job } from '@/lib/job.ts';
import mondaySdk from 'monday-sdk-js';
import { ApiService } from './Base';

// monday.com SDK
const monday = mondaySdk();
monday.setApiVersion('2023-10');

const ARCHIVE_GROUP = 'Jobs Completed Through PC';

// because we will need to violate the purpose of TypeScript, unfortunately
type DynObject = {[key: string]: any};
type MondayJobKv = { id: string, group: { title: string }, name: string};
type MondayPage = { cursor: string, items: DynObject };

const initialGetJobsPageQuery = `
query ($boardId: ID!) {
boards(ids: [$boardId]) {
	items_page (limit: 500) {
	cursor
	items {
		id
		group {
			title
		}
		name
	}
	}
}
}`;
const nextGetJobsPageQuery = `
query ($cursorId: String!) {  
	next_items_page (cursor: $cursorId, limit: 500)  {
		cursor
		items {
			id
			group {
				title
			}
			name
		}
	}
}`
const updateJobMutation = `mutation (
	$boardId: ID!,
	$itemId: ID!,
	$columnValues: JSON!
  ) {
	change_multiple_column_values (
	  board_id: $boardId,
	  item_id: $itemId,
	  column_values: $columnValues
	) {
	  id
	}
  }`;

class MondayService extends ApiService {
	boardId: number;
	columns: {
		earlyStart: string,
		mainStart:  string,
		pm:         string,
		bays:       string,
		products:   string
	}

	jobs: Record<string, Job>;
	mondayIds: Record<string, number>;

	constructor() {
		super()

		// context/settings -> update state
		monday.listen("settings", (res) => {
			// for getting column name when in settings as { columnName: true }
			const getKey = (obj: object) => Object.keys(obj)[0];
			console.log(res);

			try {
				this.columns.earlyStart = getKey(res.data["earlyStartColumn"]);
				this.columns.mainStart  = getKey(res.data["mainStartColumn"]);
				this.columns.pm         = getKey(res.data["pmColumn"]);
				this.columns.bays       = getKey(res.data["baysColumn"]);
				this.columns.products   = getKey(res.data["productsColumn"]);
			} catch (err) {}
		});

		monday.listen("context", (res: DynObject) => {
			console.log(res);

			this.boardId = res.data.boardId;
			
			const ver = res.data.appVersion.versionData;
			console.log(`App version from monday: ${ver.major}.${ver.minor}.${ver.patch}`);
		});
		
		this.boardId = -1;
		this.columns = {
			earlyStart: "",
			mainStart:  "",
			pm:         "",
			bays:       "",
			products:   ""
		};

		this.jobs = {};
		this.mondayIds = {};
	}

	validateConfig() {
		if ( this.boardId === -1 ) {
			error("Monday API cannot be called without a connected board");
		}

		else if ( this.columns.earlyStart === "" ) {
			error("Early Start not set");
		}
		else if ( this.columns.mainStart === "" ) {
			error("Main Start not set");
		}
		else if ( this.columns.pm === "" ) {
			error("PM not set");
		}
		else if ( this.columns.bays === "" ) {
			error("Bays not set");
		}
		else if ( this.columns.products === "" ) {
			error("Products not set");
		} else {
			return true;
		}

		return false;
	}

	async initJobs() {
		await this.getJobs();
	}

	addMondayJob(mondayJob: MondayJobKv) {
		if ( mondayJob.group.title !== ARCHIVE_GROUP ) {
			this.mondayIds[mondayJob.name] = parseInt(mondayJob.id);
		}
	}

	// need this to be any because the layout of params is dynamic
	getUpdateParams(job: Job): DynObject {
		let params: DynObject = {};

		if ( job.earlyStart !== null ) { params[this.columns.earlyStart] = formatDate(job.earlyStart); }
		if ( job.mainStart !== null ) { params[this.columns.mainStart] = formatDate(job.mainStart); }
		if ( job.pm != null ) { params[this.columns.pm] = job.pm; }
		if ( job.products.length > 0 ) { params[this.columns.products] = job.getProducts(); }
		if ( job.bays.length > 0 ) { params[this.columns.bays] = job.getBays(); }

		return params;
	}

	async updateJob(job: Job) {
		if ( !this.validateConfig() ) { return; }

		if ( !Object.hasOwn(this.mondayIds, job.name) ) return;

		const params = this.getUpdateParams(job);
		console.log(`Updating ${job.name}`, params);

		const mondayId = this.mondayIds[job.name];
		try {
			const variables = {
				boardId: this.boardId,
				itemId: mondayId,
				columnValues: JSON.stringify(params)
			};
			return monday.api(updateJobMutation, { variables });
		} catch (err) {
			console.log(err);
			error('Error executing GraphQL. Check console.');

			return err;
		}
	}

	async getJobs() {
		if ( !this.validateConfig() ) { return; }

		try {
			let response: { [id: string]: any } = {};
			let cursorId = null;

			let apiCall;
			let page: (res: DynObject) => MondayPage;
			do {
				if ( cursorId === null ) {
					apiCall = monday.api(initialGetJobsPageQuery, { variables: { boardId: this.boardId } });
					page = (res: any) => res.data.boards[0].items_page;
				} else {
					apiCall = monday.api(nextGetJobsPageQuery, { variables: { cursorId }})
					page = (res: any) => res.data.next_items_page;
				}

				await apiCall
					.then((res: any) => {
						console.log("Recieved jobs page");
						console.log(res);

						const data = page(res);
						cursorId = data.cursor;
						
						data.items
							.forEach((x: MondayJobKv) => this.addMondayJob(x));
					});
			} while (cursorId !== null);

			return response;
		} catch (err) {
			console.log(err);
			error('Error executing GraphQL. Check console.')
		}
	}

	error = (text: string): void => error(text);
}

function formatDate(date: Date): string {
	return date.toISOString().substring(0, 10);
}

function success(msg: string) {
	monday.execute('notice', {
		message: msg,
		type: 'success'
	});
}

function info(msg: string) {
	monday.execute('notice', {
		message: msg,
		type: 'info'
	});
}

function error(msg: string) {
	monday.execute('notice', {
		message: msg,
		type: 'error'
	});
}

export { MondayService, monday, success, info, error };
