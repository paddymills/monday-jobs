import React from "react";
import "./fileDropper.css";

export default class Terminal extends React.Component {
  constructor(props) {
    super(props);

    // Default state
    this.state = {};
  }

  render() {
    return <div className="terminal">
      <p id="caption">{this.props.status}</p>
    </div>;
  }
}