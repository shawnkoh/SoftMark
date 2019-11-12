import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { lightBlue } from "@material-ui/core/colors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    navBar: {
      width: "100%",
      position: "fixed",
      bottom: 0,
      backgroundColor: lightBlue[50]
    }
  })
);

export default useStyles;
