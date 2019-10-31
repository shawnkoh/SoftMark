import { withStyles, Theme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

export const RoundedButton = withStyles((theme: Theme) => ({
  root: {
    borderRadius: 24,
    margin: theme.spacing(1)
  }
}))(Button);
