import React from "react";
import AddIcon from "@material-ui/icons/Add";
import { Button, Typography } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

interface OwnProps {
  text: string;
  onClick: () => void;
}

type Props = OwnProps;

const AddButton: React.FC<Props> = ({ text, onClick }) => {
  return (
    <Button onClick={onClick}>
      <AddIcon color="primary" />
      <Typography color="primary" variant="h5" align="center">
        {text}
      </Typography>
    </Button>
  );
};

export default AddButton;
