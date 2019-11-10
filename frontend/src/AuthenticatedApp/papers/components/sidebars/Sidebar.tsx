import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  BottomNavigationAction,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";
import { Check, Person, TrendingUp } from "@material-ui/icons";

export const drawerWidth = 100;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3)
  }
}));

type Props = RouteComponentProps;

const Sidebar: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper
      }}
      anchor="left"
    >
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <ListItem alignItems="flex-start" key={1} button>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <br />
          Portfolio
        </ListItem>
        <ListItem alignItems="flex-start" key={1} button>
          <BottomNavigationAction
            color="inherit"
            component={Link}
            to="/portfolio"
            value="/portfolio"
            label="Portfolio"
            icon={<Person />}
          />
        </ListItem>
        <ListItem alignItems="flex-start" key={1} button>
          <BottomNavigationAction
            color="primary"
            component={Link}
            to="/stub"
            value="/portfolio"
            label="Portfolio"
            icon={<Check />}
          />
        </ListItem>
        <ListItem alignItems="flex-start" key={1} button>
          <BottomNavigationAction
            color="inherit"
            component={Link}
            to="/portfolio"
            value="/portfolio"
            label="Portfolio"
            icon={<TrendingUp />}
          />
        </ListItem>
      </List>
    </Drawer>
  );
}; // onClick={() => props.history.push("/portfolio")}

export default withRouter(Sidebar);
