import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#039BE5", contrastText: "#ffffff" },
    background: { default: "#fafafa", paper: "#ffffff" }
  }
});

export default theme;
