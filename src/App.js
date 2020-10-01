import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();

class App extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      settings: {},
      name: "",
    };
  }

  componentDidMount() {
    // TODO: set up event listeners
  }

  dropHandler(event) {
    event.preventDefault();
    console.log(event);
  }

  dragOverHandler(event) {
    console.log(event);
  }

  render() {
    return <div className="App">
      <div id="drop_zone" onDrop="{this.dropHandler}" onDragOver="{this.dragOverHander}">
        <p>Drop file(s) here...</p>
      </div>
    </div>;
  }
}

export default App;
