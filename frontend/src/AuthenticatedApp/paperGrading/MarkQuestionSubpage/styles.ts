import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { lightBlue } from "@material-ui/core/colors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      minHeight: "100vh",
      minWidth: "100vw",
      display: "flex",
      flexDirection: "column",
      touchAction: "none"
    },
    innerContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    grow: {
      display: "flex",
      flexGrow: 1
    },
    text: {
      whiteSpace: "nowrap",
      marginLeft: theme.spacing(2)
    },
    button: {
      minWidth: "initial",
      marginLeft: theme.spacing(2)
    },
    backButton: {
      marginRight: theme.spacing(2)
    },
    prevPageButton: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      margin: "auto"
    },
    nextPageButton: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      margin: "auto"
    },
    pageLabel: {
      position: "absolute",
      bottom: theme.spacing(10),
      left: 0,
      right: 0,
      margin: "0 auto"
    },
    questionBar: {
      backgroundColor: lightBlue[50],
      top: "auto",
      bottom: 0,
      overflowX: "auto"
    },
    questionBarItem: {
      marginRight: theme.spacing(1)
    },
    slider: {
      width: "100%",
      marginTop: theme.spacing(4)
    },
    canvasWithToolbarContainer: {
      position: "relative",
      display: "flex",
      flexGrow: 1
    },
    popover: {
      width: theme.spacing(32)
    }
  })
);

export default useStyles;
