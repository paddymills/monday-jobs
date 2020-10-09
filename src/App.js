import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import FileParser from "./services/FileParserService";
import mondayService from "./services/MondayService.js";
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

    this.fileParser = new FileParser();
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

          this.fileParser.initConfig(this.state);

          break;
        case 'context':
          this.setState({ boardId: res.data.boardIds[0] });

          mondayService
            .getJobs(this.state.boardId)
            .then(res => this.fileParser.initJobs(res));

          break;
        default:
          break;
      }
    });
  }

  dropHandler(event) {
    event.preventDefault();

    let files = event.dataTransfer.files;
    // TODO: get item ids and store in state

    for (const file of files) {
      let res = this.fileParser.parseFile(file);
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
