import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4)
    },
    margin: {
      marginTop: theme.spacing(2)
    },
    marginRight: {
      marginRight: theme.spacing(1)
    },
    tableWrapper: {
      overflowX: "auto"
    },
    grow: {
      flexGrow: 1
    }
  })
);

export default useStyles;
