import React from "react";
import "./fileDropper.css";

const DropState = {
  None: '',
  Dropping:  'dropZoneHover',
  Dropped: 'dropZoneComplete'
};

export default class FileDropBox extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      drop: DropState.None
    };

    this.callback = props.callback;
    this.preDropCallback = props.preDropCallback;
    this.fileParser = props.fileParserCallback;
  }

  dragHandler(event) {
    event.preventDefault();

    if (event.type === "dragover") {
      this.setState({ drop: DropState.Dropping });
    }
    else if (event.type === "dragexit") {
      this.setState({ drop: DropState.None });
    }
  }

  async dropHandler(event) {
    this.setState({ drop: DropState.Dropped });

    event.preventDefault();
    const files = event.dataTransfer.files;

    if (this.preDropCallback) {
      await this.preDropCallback();
    }

    for (const file of files) {
      // handle drop event
      this.fileParser
        .parseFile(file)
        .then(res => this.callback(res));
    }

    return;
  }

  render() {
    return <div className={'dropZone ' + this.state.drop}
      onDrop={(e) => this.dropHandler(e)}
      onDragOver={(e) => this.dragHandler(e)}
      onDragExit={(e) => this.dragHandler(e)}>
      <p>Drop file(s) here...</p>
    </div>;
  }
}