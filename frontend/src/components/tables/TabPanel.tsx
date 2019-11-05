import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Box, Typography } from "@material-ui/core";

interface OwnProps {
  index: any;
  value: any;
}

type Props = OwnProps & RouteComponentProps;

const TabPanel: React.FC<Props> = props => {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
};

export default withRouter(TabPanel);
