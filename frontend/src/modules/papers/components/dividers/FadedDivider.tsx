import React from "react";
import { Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../../../../theme";

const useStyles = makeStyles(() => ({
  divider: {
    minHeight: 5
  }
}));

const BlueDivider: React.FC<any> = () => {
  const classes = useStyles();
  return <Divider className={classes.divider} />;
};

export default BlueDivider;
