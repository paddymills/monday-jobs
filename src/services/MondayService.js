import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

const ARCHIVE_GROUP = "Jobs Completed Through PC";

export default class MondayService {
  static async updateJob(job, vals) {
    // get job id
    // update with vals
    // may need to process one at a time

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
        boardId: this.state.boardId,
        itemId: null,
        columnValues: JSON.stringify(vals)
      };

      monday.api(query, { variables });
    } catch (err) {
      console.log(err);

      this.error("Error executing GraphQL. Check console.");
    }
  }

  static async getJobs(boardId) {
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

      let response = {};
      monday.api(query, { variables }).then(res => {
        res.data.boards[0].items
          .filter(x => x.group.title !== ARCHIVE_GROUP)
          .forEach(x => response[x.name] = Number(x.id));
      });

      return response;

    } catch (err) {
      console.log(err);

      this.error("Error executing GraphQL. Check console.");
    }
  }

  static async changeColumnValue(boardId, itemId, columnId, value) {
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
  };

  static success(msg) {
    monday.execute("notice", {
      message: msg,
      type: "success",
    });
  }

  static info(msg) {
    monday.execute("notice", {
      message: msg,
      type: "info",
    });
  }

  static error(msg) {
    monday.execute("notice", {
      message: msg,
      type: "error",
    });
  }
}

function handleError(error) {
  monday.execute("notice", {
    message: "Error executing GraphQL. Check console.",
    type: "error",
  });

  console.log(error);
}
