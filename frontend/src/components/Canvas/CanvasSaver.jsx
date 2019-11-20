import React from "react";
import Konva, { Stage, Layer, Line } from "react-konva";

import UrlImage from "./UrlImage";

function downloadURI(uri, name) {
  var link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

class CanvasSaver extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    // log stage react wrapper
    // log Konva.Stage instance
    console.log(this.refs.stage.getStage());
    const stage = this.refs.stage.getStage();
    //downloads the stage as a .png file
    setTimeout(async () => {
      console.log("Stage");
      console.log(stage.toDataURL());
      var dataURL = await stage.toDataURL();
      console.log(dataURL);
      //downloadURI(dataURL, 'stage.png');
    }, 7000);
  }

  componentDidUpdate() {
    
  }

  async componentWillUnmount() {
    
  }

  render() {
    return (
      <Stage
        ref="stage"
        width={1000}
        height={1500}
        scaleX={1}
        scaleY={1}
        x={32}
        y={32}
        style={{ touchAction: "none" }}
      >
        <Layer>
          <UrlImage src={this.props.backgroundImageSource} />
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
