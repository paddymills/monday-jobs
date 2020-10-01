import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

// for getting column name when in settings as { columnName: true }
function getKey(obj) {
  return Object.keys(obj)[0];
}

class App extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      boardId: null,
      jobs: {},
      dropping: false,
      dropped: false,
    };
  }

  componentDidMount() {
    console.clear();

    // context/settings -> update state
    monday.listen(['settings', 'context'], res => {
      switch (res.type) {
        case 'settings':
          this.setState({
            earlyStartColumn: getKey(res.data.earlyStartColumn),
            mainStartColumn: getKey(res.data.mainStartColumn),
            pmColumn: getKey(res.data.pmColumn),
            baysColumn: getKey(res.data.baysColumn),
            productsColumn: getKey(res.data.productsColumn),
          });

          break;
        case 'context':
          this.setState({ boardId: res.data.boardIds[0] });

          break;
        default:
          break;
      }
    });
  }

  async fileHandler(fileText) {
    fileText.split("\r\n")
      .map(line => line.split(","))
      .filter(x => x[0])
      .forEach(line => {
        console.log([
          line[0],
          {
            [this.state.earlyStartColumn]: line[1],
            [this.state.mainStartColumn]: line[2],
            [this.state.pmColumn]: null,
            [this.state.baysColumn]: null,
            [this.state.productsColumn]: null,
          }
        ]);
      });

  }

  updateJob(job, vals) {
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

      monday.execute("notice", {
        message: "Error executing GraphQL. Check console.",
        type: "error",
      });
    }
  }

  dropHandler(event) {
    event.preventDefault();

    let files = event.dataTransfer.files;
    for (const file of files) {
      file.text().then(res => this.fileHandler(res));
    }

    this.setState({ dropping: false, dropped: true });
  }

  dragHandler(event) {
    event.preventDefault();

    switch (event.type) {
      case 'dragover':
        this.setState({ dropping: true });
        break;
      case 'dragexit':
        this.setState({ dropping: false });
        break;
      default:
        break;
    }
  }

  render() {
    let className = 'dropZone';
    if (this.state.dropping) {
      className += ' dropZoneHover';
    } else if (this.state.dropped) {
      className += ' dropZoneComplete';
    }

    return <div className="App">
      <div className={className}
        onDrop={(e) => this.dropHandler(e)}
        onDragOver={(e) => this.dragHandler(e)}
        onDragExit={(e) => this.dragHandler(e)}>
        <p>Drop file(s) here...</p>
      </div>
    </div>;
  }
}

export default App;
