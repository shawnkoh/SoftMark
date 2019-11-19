import { createMuiTheme } from "@material-ui/core/styles";
import lightBlue from "@material-ui/core/colors/lightBlue";
import green from "@material-ui/core/colors/green";

const theme = createMuiTheme({
  palette: {
    primary: { main: lightBlue[600], contrastText: "#ffffff" },
    secondary: { main: green[600], contrastText: "#ffffff" },
    background: { default: "#fafafa", paper: "#ffffff" }
  }
});

export default theme;
