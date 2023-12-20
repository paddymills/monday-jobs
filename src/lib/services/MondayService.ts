import mondaySdk from 'monday-sdk-js';
const monday = mondaySdk();
monday.setApiVersion('2023-10');

const ARCHIVE_GROUP = 'Jobs Completed Through PC';

export class MondayService {
	static async updateJob(boardId: Number, vals: any) {
		// get job id
		// update with vals
		// may need to process one at a time

		const { id, ...columnVals } = vals;

		try {
			const query = `mutation (
        $boardId: Int!,
        $itemId: Int!,
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
			const variables = {
				boardId: boardId,
				itemId: id,
				columnValues: JSON.stringify(columnVals)
			};
			return monday.api(query, { variables });
		} catch (err) {
			console.log(err);

			this.error('Error executing GraphQL. Check console.');

			return err;
		}
	}

	static async getJobs(boardId: number) {
		try {
			const query = `query (
        $boardId: Int!
      ) {
        boards (ids: [$boardId]) {
          items {
            id,
            group {
              title
            }
            name
          }
        }
      }`;
			const variables = { boardId };

			let response: { [id: string]: any } = {};
			await monday.api(query, { variables }).then((res: any) => {
				res.data.boards[0].items
					.filter((x: any) => x.group.title !== ARCHIVE_GROUP)
					.forEach((x: { id: string, name: string }) => (response[x.name] = { id: parseInt(x.id) }));
			});

			return response;
		} catch (err) {
			console.log(err);

			this.error('Error executing GraphQL. Check console.');
		}
	}

	static async changeColumnValue(boardId: number, itemId: number, columnId: number, value: any) {
		try {
			const query = `mutation (
        $boardId: Int!, $itemId: Int!,
        $columnId: String!,
        $value: JSON!
      ) {
        change_column_value (
          board_id: $boardId,
          item_id: $itemId,
          column_id: $columnId,
          value: $value
        ) {
          id
        }
      }`;
			const variables = {
				boardId,
				columnId,
				itemId,
				value
			};

			const response = await monday.api(query, {
				variables
			});

			return response;
		} catch (err) {
			handleError(err);
		}
	}

	static success(msg: string) {
		monday.execute('notice', {
			message: msg,
			type: 'success'
		});
	}

	static info(msg: string) {
		monday.execute('notice', {
			message: msg,
			type: 'info'
		});
	}

	static error(msg: string) {
		monday.execute('notice', {
			message: msg,
			type: 'error'
		});
	}
}

function handleError(error: any) {
	monday.execute('notice', {
		message: 'Error executing GraphQL. Check console.',
		type: 'error'
	});

	console.log(error);
}
