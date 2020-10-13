import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import FileParser from "./services/FileParserService.js";
import mondayService from "./services/MondayService.js";
import { isPromiseResolved } from "promise-status-async";
const monday = mondaySdk();


// for getting column name when in settings as { columnName: true }
function getKey(obj) {
  return Object.keys(obj)[0];
}

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
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
      status: "nothing...",
    };

    this.fileParser = new FileParser();
  }

  componentDidMount() {
    console.clear();

    // context/settings -> update state
    monday.listen(['settings', 'context'], res => {
      if (res.type === 'settings') {
        this.setState({
          earlyStartColumn: getKey(res.data.earlyStartColumn),
          mainStartColumn: getKey(res.data.mainStartColumn),
          pmColumn: getKey(res.data.pmColumn),
          baysColumn: getKey(res.data.baysColumn),
          productsColumn: getKey(res.data.productsColumn),
        });

      }

      else if (res.type === 'context') {
        this.setState({ boardId: res.data.boardIds[0] });
      }

      // update file parser config
      this.fileParser.initConfig(this.state);
    });
  }

  async dropHandler(event) {
    event.preventDefault();

    let files = event.dataTransfer.files;
    this.setState({ dropping: false, dropped: true });

    let fulfilledPromises = 0;

    // fetch item ids
    this.updateStatus('Fetching IDs...');
    await this.fileParser.initJobs();

    // fetch item ids
    this.updateStatus(`Parsing file(s)...`);
    let updatePromises = [];
    for (const file of files) {
      await this.fileParser
        .parseFile(file)
        .then(res => {
          res.forEach(update => {
            const { job, vals } = update;
            // updatePromises.push(mondayService.updateJob(this.state.boardId, vals));
            const dur = Math.floor(Math.random() * 8) + 2
            updatePromises.push(new Promise(resolve => setTimeout(resolve, dur * 1000)));
          });
        });
    }

    // log updates
    let awaitingPromises = true;
    Promise.allSettled(updatePromises).then(() => {
      console.log("All done!");
      awaitingPromises = false;
    });
    do {
      await sleep(0.1);

      this.updateStatus(`Updating item(s)...[${fulfilledPromises}/${updatePromises.length}]`);
    } while (awaitingPromises);

    this.updateStatus(`Updating item(s)...[${fulfilledPromises}/${updatePromises.length}]`);

    // clear status
    // this.setState({ status: null });
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

  updateStatus(statusText) {
    this.setState({ status: statusText });
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
      <p id="caption">{this.state.status}</p>
    </div>;
  }
}

export default App;
