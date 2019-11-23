import { Typography } from "@material-ui/core";
import React from "react";

interface Props {
  index: any;
  value: any;
}

const TabPanel: React.FC<Props> = props => {
  const { children, index, value, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </Typography>
  );
};

export default TabPanel;
