import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    navBar: {
      width: "100%",
      position: "fixed",
      bottom: 0,
      backgroundColor: blue[50]
    },
    grow: {
      flexGrow: 1
    }
  })
);

export default useStyles;
