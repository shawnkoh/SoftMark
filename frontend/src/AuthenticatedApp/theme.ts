import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#2C98F0", contrastText: "#ffffff" },
    secondary: { main: "#4CAF50", contrastText: "#ffffff" },
    background: { default: "#fafafa", paper: "#ffffff" }
  }
});

export default theme;
