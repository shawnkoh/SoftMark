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
  label: string;
  onClick?: () => void;
  filled?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
}

type Props = OwnProps;

const ThemedButton: React.FC<Props> = ({
  label,
  onClick = () => {},
  filled,
  disabled = false,
  fullWidth = false,
  size = "medium"
}) => {
  const classes = useStyles();

  return filled ? (
    <Button
      onClick={onClick}
      size={size}
      disabled={disabled}
      variant="contained"
      style={{ borderRadius: 25 }}
      color="primary"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  ) : (
    <Button
      onClick={onClick}
      size={size}
      style={{ borderRadius: 25 }}
      disabled={disabled}
      color="primary"
      fullWidth={fullWidth}
    >
      {label}
    </Button>
  );
};

export default ThemedButton;
