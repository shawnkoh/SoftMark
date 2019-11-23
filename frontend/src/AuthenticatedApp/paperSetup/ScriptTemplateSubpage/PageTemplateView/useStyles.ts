import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: "relative",
    maxHeight: "calc(99vh - 64px)",
    maxWidth: "100%"
  },
  scriptImage: {
    objectFit: "contain",
    maxHeight: "calc(99vh - 64px)",
    maxWidth: "100%"
  },
  addFab: {
    position: "absolute",
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: 1
  },
  panel: {
    maxHeight: "100vh"
  }
}));

export default useStyles;
