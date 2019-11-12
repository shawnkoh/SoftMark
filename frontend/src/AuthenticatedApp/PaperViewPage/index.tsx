import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Check, People, Person, Settings } from "@material-ui/icons";
import React, { useState } from "react";
import { useRouteMatch } from "react-router";
import { Link, Route, Switch } from "react-router-dom";
import { PaperProvider } from "../../contexts/PaperContext";
import PaperViewHeader from "./components/PaperViewHeader";
import useStyles from "./styles";
import SetupSubpage from "./subpages/Setup";
import GradingSubpage from "./subpages/Grading";
import ScriptsSubpage from "./subpages/Scripts";

const TEAM = "team";
const SETUP = "setup";
const GRADING = "grading";
const SCRIPTS = "scripts";

const PaperView: React.FC = () => {
  const classes = useStyles();
  // https://reacttraining.com/react-router/web/example/nesting
  const { path, url } = useRouteMatch()!;
  const [value, setValue] = useState(SETUP);

  return (
    <PaperProvider>
      <PaperViewHeader />
      <Switch>
        <Route exact path={`${path}/setup`} component={SetupSubpage} />
        <Route exact path={`${path}/grading`} component={GradingSubpage} />
        <Route exact path={`${path}/scripts`} component={ScriptsSubpage} />
      </Switch>
      <BottomNavigation
        className={classes.navBar}
        value={value}
        onChange={(event: any, newValue: string) => {
          setValue(newValue);
        }}
        showLabels // removing this prop is sufficient to remove labels for unselected tabs
      >
        <BottomNavigationAction
          component={Link}
          to={`${url}/${SETUP}`}
          value={SETUP}
          label="Setup"
          icon={<Settings />}
        />
        <BottomNavigationAction
          component={Link}
          to={`${url}/${GRADING}`}
          value={GRADING}
          label="Grading"
          icon={<Check />}
        />
        <BottomNavigationAction
          component={Link}
          to={`${url}/${SCRIPTS}`}
          value={SCRIPTS}
          label="Scripts"
          icon={<People />}
        />
      </BottomNavigation>
    </PaperProvider>
  );
};

export default PaperView;
