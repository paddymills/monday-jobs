import React from "react";
import "./App.css";

// components
import FileDropBox from "./components/fileDropper.js";
import Terminal from "./components/terminal.js";

// services
import FileParser from "./services/FileParserService.js";
import mondayService from "./services/MondayService.js";

// monday.com SDK
import mondaySdk from "monday-sdk-js";
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
      status: "null",
    };

    this.fileParser = new FileParser();

    // bind this so you can use callbacks
    this.preDrop.bind(this);
    this.dropCallback.bind(this);
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

  preDrop() {
    // fetch item ids
    this.updateStatus('Fetching IDs...');

    return this.fileParser.initJobs();
  }

  async dropCallback(parsedFileVals) {
    let fulfilledPromises = 0;

    // process updates
    this.updateStatus(`Parsing file(s)...`);
    let updatePromises = [];
    for (const update of parsedFileVals) {
      const { job, vals } = update;
      const dur = Math.floor(Math.random() * 8) + 2
      let p = new Promise(resolve => setTimeout(resolve, dur * 1000))

      // let p = mondayService.updateJob(this.state.boardId, vals);
      p.then(() => { fulfilledPromises++; });
      updatePromises.push(p);
    }

    // log updates
    let awaitingPromises = true;
    Promise.allSettled(updatePromises).then(() => {
      awaitingPromises = false;
    });
    do {
      await sleep(0.1);

      this.updateStatus(`Updating item(s)...[${fulfilledPromises}/${updatePromises.length}]`);
    } while (awaitingPromises);

    // clear status
    this.updateStatus(`Complete...[${fulfilledPromises}/${updatePromises.length}]`);
  }

  updateStatus(statusText) {
    this.setState({ status: statusText });
    console.log(statusText);
  }

  render() {
    return <div className="App">
      <FileDropBox
        preDropCallback={() => this.preDrop()}
        callback={(res) => this.dropCallback(res)}
        fileParserCallback={this.fileParser} />
      <Terminal status={this.state.status} />
    </div>;
  }
}

export default App;
