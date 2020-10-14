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
      dropping: false,
      dropped: false,
    };


    this.fileParser = new FileParser();
    this.termRef = React.createRef();
    this.term = null;

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

    this.term = this.termRef.current;
  }

  async preDrop() {
    // called when file(s) are dropped, but before parsing

    // fetch item ids
    const id = this.term.pushStatus('Fetching IDs...');
    await this.fileParser.initJobs();
    this.term.updateItemState(id, "complete")

    return this;
  }

  async dropCallback(parsedFileVals) {
    let fulfilledPromises = 0;
    let updatePromises = [];
    let statusId = null;

    // process updates
    const progress = () => `${fulfilledPromises}/${updatePromises.length}`;
    statusId = this.term.pushStatus(`Updating item(s)...[${progress()}]`);
    for (const update of parsedFileVals) {
      const { job, vals } = update;
      const dur = Math.floor(Math.random() * 8) + 2
      let p = new Promise(resolve => setTimeout(resolve, dur * 1000))

      // let p = mondayService.updateJob(this.state.boardId, vals);
      this.term.pushItem({
        id: vals.id,
        level: 2,
        state: "pending",
        value: job,
      });
      p.then(() => {
        fulfilledPromises++;
        this.term.updateItemState(vals.id, "complete");
      });
      updatePromises.push(p);
    }
    this.term.updateItemState(statusId, "complete")

    let awaitingPromises = true;
    Promise.allSettled(updatePromises).then(() => {
      awaitingPromises = false;
    });

    do {
      await sleep(0.1);

      this.term.updateItemValue(statusId, `Updating item(s)...[${progress()}]`);
    } while (awaitingPromises);

    // complete updates
    this.term.updateItemState(statusId, "complete");
  }

  render() {
    return <div className="App">
      <FileDropBox
        preDropCallback={() => this.preDrop()}
        callback={(res) => this.dropCallback(res)}
        fileParserCallback={this.fileParser} />
      <Terminal ref={this.termRef} />
    </div>;
  }
}

export default App;
