import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Check, People, Person, Settings } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  navBar: {
    width: "100%",
    height: "7%",
    position: "fixed",
    bottom: 0,
    backgroundColor: "#2b4980"
  },
  navIcon: {
    height: 30,
    width: 30,
    color: "#edeff1",
    backgroundColor: "#2b4980"
  },
  labelOn: {
    color: "#edeff1"
  },
  labelOff: {
    color: "#2b4980",
    backgroundColor: "#2b4980"
  }
}));

type Props = RouteComponentProps;

const BottomNav: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();

  const paper_id = +(params as { paper_id: string }).paper_id;
  const [value, setValue] = React.useState("account");

  return (
    <BottomNavigation
      className={classes.navBar}
      color="primary"
      value={value}
      onChange={(event: any, newValue: string) => {
        setValue(newValue);
      }}
      showLabels
    >
      <BottomNavigationAction
        component={Link}
        value="account"
        label="Account"
        classes={{
          label: value === "account" ? classes.labelOn : classes.labelOff
        }}
        icon={<Person className={classes.navIcon} />}
      />
      <BottomNavigationAction
        component={Link}
        value="settings"
        label="Settings"
        classes={{
          label: value === "settings" ? classes.labelOn : classes.labelOff
        }}
        icon={<Settings className={classes.navIcon} />}
      />
      <BottomNavigationAction
        component={Link}
        //to={`/papers/${paper_id}/grading`}
        value="grading"
        label="Grading"
        classes={{
          label: value === "grading" ? classes.labelOn : classes.labelOff
        }}
        icon={<Check className={classes.navIcon} />}
      />
      <BottomNavigationAction
        component={Link}
        value="students"
        label="Students"
        classes={{
          label: value === "students" ? classes.labelOn : classes.labelOff
        }}
        icon={<People className={classes.navIcon} />}
      />
    </BottomNavigation>
  );
};

export default withRouter(BottomNav);
