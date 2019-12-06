import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#2C98F0", contrastText: "#ffffff" },
    secondary: { main: "#81C784", contrastText: "#ffffff" },
    background: { default: "#fafafa", paper: "#ffffff" }
  }
});

export default theme;
