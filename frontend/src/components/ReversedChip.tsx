import Chip from "@material-ui/core/Chip";
import { withStyles } from "@material-ui/core/styles";

const ReversedChip = withStyles({
  root: {
    direction: "rtl",
    "& $avatar": {
      direction: "ltr",
      display: "inline-flex",
      width: "auto",
      minWidth: 24,
      borderRadius: 12,
      paddingLeft: 8,
      paddingRight: 8,
      marginLeft: -6,
      marginRight: 5
    }
  },
  avatar: {}
})(Chip);

export default ReversedChip;
