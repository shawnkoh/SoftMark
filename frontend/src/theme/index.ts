// Material helpers
import { createMuiTheme } from "@material-ui/core";

import palette from "./palette";

const theme = createMuiTheme({
  palette,
  zIndex: {
    appBar: 7,
    drawer: 6
  }
});

export default theme;
