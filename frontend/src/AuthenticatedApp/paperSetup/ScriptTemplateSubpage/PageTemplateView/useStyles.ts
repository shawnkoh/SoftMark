import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: "relative"
  },
  scriptImage: {
    objectFit: "contain",
    maxHeight: "calc(99vh - 64px)",
    width: "100%"
  },
  addFab: {
    position: "absolute",
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: 1
  },
  panel: {
    height: "100vh"
  }
}));

export default useStyles;
