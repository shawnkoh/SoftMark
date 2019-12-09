import React from "react";
import { Layer, Line, Stage, Text } from "react-konva";
import UrlImage from "./UrlImage";

class CanvasSaver extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0 };
    this.handleLoad = this.handleLoad.bind(this);
  }

  handleLoad(width, height) {
    this.setState({ width, height }, () => {
      const stage = this.refs.stage.getStage();
      const dataURL = stage.toDataURL({ mimeType: "image/jpeg" });
      this.props.callBackImageUrl(dataURL);
    });
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
        fill="red"
      >
        <Layer>
          <UrlImage
            src={this.props.backgroundImageSource}
            onLoad={this.handleLoad}
          />
        </Layer>
        <Layer>
          {this.props.questions.map((question, index) => (
            <Text
              key={index}
              fontSize={42}
              text={`${
                question.score !== null ? question.score : "UNMARKED"
              } / ${question.maxScore}`}
              wrap="char"
              x={question.leftOffset}
              y={question.topOffset}
              fill="red"
            />
          ))}
        </Layer>
        <Layer>
          {this.props.backgroundAnnotations.map(backgroundAnnotationLines =>
            backgroundAnnotationLines.map((line, index) => (
              <Line
                key={index}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.width}
                globalCompositeOperation={line.type}
                lineJoin="round"
                lineCap="round"
              />
            ))
          )}
        </Layer>
      </Stage>
    );
  }
}

export default CanvasSaver;
