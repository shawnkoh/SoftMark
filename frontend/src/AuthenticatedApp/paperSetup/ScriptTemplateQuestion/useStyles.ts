import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fab: {
      position: "absolute",
      cursor: "move",
      padding: theme.spacing(2),
      fontSize: theme.typography.body1.fontSize
    },
    score: {
      marginLeft: theme.spacing(1),
      color: "#fff",
      backgroundColor: theme.palette.primary.dark,
      borderRadius: 15,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    }
  })
);

export default useStyles;
