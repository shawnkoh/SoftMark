import { withStyles, createStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const RoundedButton = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 24
    }
  })
)(Button);

export default RoundedButton;
