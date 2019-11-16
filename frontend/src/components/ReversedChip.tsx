import Chip from "@material-ui/core/Chip";
import { withStyles } from "@material-ui/core/styles";

const ReversedChip = withStyles({
  root: {
    direction: "rtl",
    "& $avatar": {
      marginLeft: "-6px",
      marginRight: "5px"
    }
  },
  avatar: {}
})(Chip);

export default ReversedChip;
