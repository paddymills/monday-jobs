import React from "react";
import "./fileDropper.css";

export default class FileDropBox extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {
      dropping: false,
      dropped: false
    };

    this.callback = props.callback;
    this.preDropCallback = props.preDropCallback;
    this.fileParser = props.fileParserCallback;
  }

  dragHandler(event) {
    event.preventDefault();

    if (event.type === "dragover") {
      this.setState({ dropping: true });
    }
    else if (event.type === "dragexit") {
      this.setState({ dropping: false });
    }
  }

  async dropHandler(event) {
    this.setState({ dropping: false, dropped: true });

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
  }

  getClassName() {
    let className = 'dropZone';

    if (this.state.dropping) {
      className += ' dropZoneHover';
    } else if (this.state.dropped) {
      className += ' dropZoneComplete';
    }

    return className
  }

  render() {
    return <div className={this.getClassName()}
      onDrop={(e) => this.dropHandler(e)}
      onDragOver={(e) => this.dragHandler(e)}
      onDragExit={(e) => this.dragHandler(e)}>
      <p>Drop file(s) here...</p>
    </div>;
  }
}