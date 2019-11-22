import React from "react";
import Konva, { Stage, Layer, Line } from "react-konva";

import UrlImage from "./UrlImage";

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

class CanvasSaver extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0 };
    this.handleLoad = this.handleLoad.bind(this);
  }

  async componentDidMount() {   
      const stage = this.refs.stage.getStage();
      // sends back image dataurl to parent component
      // if (this.state.width !== 0 && this.state.height !== 0) { will add this back later
      setTimeout(async () => {
          var dataURL = await stage.toDataURL();
          this.props.callBackImageUrl(dataURL);
      }, 3000);
  }

  componentDidUpdate() {
    // shouldnt send the data URL back more than once
  }

  async componentWillUnmount() {}

  handleLoad(width, height) {
    this.setState({ width, height });
  }

  render() {
    return (
      <Stage
        ref="stage"
        width={this.state.width}
        height={this.state.height}
        scaleX={1}
        scaleY={1}
        x={0}
        y={0}
      >
        <Layer>
          <UrlImage
            src={this.props.backgroundImageSource}
            onLoad={this.handleLoad}
          />
        </Layer>
        {this.props.backgroundAnnotations.map(
          (backgroundAnnotationLines, i) => (
            <Layer key={i}>
              {backgroundAnnotationLines.map((line, j) => (
                <Line
                  key={j}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.width}
                  globalCompositeOperation={line.type}
                  lineJoin="round"
                  lineCap="round"
                />
              ))}
            </Layer>
          )
        )}
      </Stage>
    );
  }
}

export default CanvasSaver;
