import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { useSelector } from "react-redux";
import { Toolbar, AppBar, Typography, Grid, Button } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import { PaperData } from "backend/src/types/papers";

interface OwnProps {
  paper: PaperData;
  title: string;
}

type Props = RouteComponentProps & OwnProps;

const Header: React.FC<Props> = props => {
  const { paper, title } = props;
  const { name } = paper;

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar>
        <Typography color="secondary" variant="h5">
          {name}
        </Typography>
      </Toolbar>
      <Toolbar>
        <Typography color="secondary" variant="h6">
          {title}
        </Typography>
        <Button
          color="secondary"
          onClick={() => props.history.push("/portfolio")}
        >
          <Person />
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default withRouter(Header);
