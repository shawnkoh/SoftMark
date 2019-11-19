import { Switch } from "@material-ui/core";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";
import { withStyles } from "@material-ui/core/styles";

const VerificationSwitch = withStyles({
  switchBase: {
    color: red[500],
    "&$checked": {
      color: green[500]
    },
    "&$checked + $track": {
      backgroundColor: green[500]
    }
  },
  checked: {},
  track: {
    backgroundColor: red[500]
  }
})(Switch);

export default VerificationSwitch;
