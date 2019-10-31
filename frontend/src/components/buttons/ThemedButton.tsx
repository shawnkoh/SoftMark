import React from "react";
import AddIcon from "@material-ui/icons/Add";
import { Button, Typography } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1)
  }
}));

interface OwnProps {
  text: string;
  onClick: () => void;
  filled?: boolean;
  disabled?: boolean;
}

type Props = OwnProps;

const ThemedButton: React.FC<Props> = ({
  text,
  onClick,
  filled,
  disabled = false
}) => {
  const classes = useStyles();

  return filled ? (
    <Button
      onClick={onClick}
      size="medium"
      disabled={disabled}
      variant="contained"
      style={{ borderRadius: 25 }}
      color="primary"
    >
      <Typography variant="h5" align="center">
        {text}
      </Typography>
    </Button>
  ) : (
    <Button
      onClick={onClick}
      size="medium"
      style={{ borderRadius: 25 }}
      disabled={disabled}
      color="primary"
    >
      <Typography color="primary" variant="h5" align="center">
        {text}
      </Typography>
    </Button>
  );
};

export default ThemedButton;
