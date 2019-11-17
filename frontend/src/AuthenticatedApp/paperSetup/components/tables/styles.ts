import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableWrapper: {
      overflowX: "auto"
    },
    margin: {
      marginBottom: theme.spacing(1)
    },
    grow: {
      flexGrow: 1
    },
    green: {
      color: green[500]
    },
    red: {
      color: red[500]
    },
    redButton: {
      color: theme.palette.getContrastText(red[500]),
      backgroundColor: red[500],
      "&:hover": {
        backgroundColor: red[700]
      }
    }
  })
);

export default useStyles;
