import { makeStyles, Theme } from "@material-ui/core/styles";

const drawerWidth = 200;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "100%"
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    minHeight: "100vh",
    maxHeight: "100vh"
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  menuButton: {
    marginRight: 36
  },
  hide: {
    display: "none"
  },
  toolbar: theme.mixins.toolbar,
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  avatar: {
    color: "#fff",
    backgroundColor: theme.palette.primary.light
  },
  avatarSelected: {
    color: "#fff",
    backgroundColor: theme.palette.primary.dark
  },
  questionTreeRoot: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
}));

export default useStyles;
