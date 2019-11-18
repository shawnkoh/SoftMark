import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: "relative"
  },
  scriptImage: {
    objectFit: "contain",
    height: "calc(99vh - 64px)"
  },
  addFab: {
    position: "absolute",
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: 1
  }
}));

export default useStyles;
