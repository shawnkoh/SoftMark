import { withStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

const BorderLinearProgress = withStyles({
  root: {
    height: 12,
    borderRadius: 12
  },
  bar: {
    borderRadius: 12
  }
})(LinearProgress);

export default BorderLinearProgress;
