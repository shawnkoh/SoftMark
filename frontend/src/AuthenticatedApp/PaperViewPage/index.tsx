import React, { useState } from "react";
import { useRouteMatch, RouteComponentProps } from "react-router";
import { Link, Route, Switch } from "react-router-dom";

import { PaperProvider } from "../../contexts/PaperContext";

import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Check, People, Person, Settings } from "@material-ui/icons";

import useStyles from "./styles";
import PaperViewHeader from "./components/PaperViewHeader";
import SetupSubpage from "./subpages/Setup";
import GradingSubpage from "./subpages/Grading";
import ScriptsSubpage from "./subpages/Scripts";
import { ScriptMapping, ScriptTemplateView } from "../paperSetup";
import { MarkQuestionPage } from "../paperGrading";

const SETUP = "setup";
const GRADING = "grading";
const SCRIPTS = "scripts";

const PaperView: React.FC = () => {
  const classes = useStyles();
  // https://reacttraining.com/react-router/web/example/nesting
  const { path, url } = useRouteMatch()!;
  const [value, setValue] = useState(SETUP);

  const BottomNav = () => (
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
  );

  return (
    <PaperProvider>
      <Switch>
        <Route
          path={`${path}/setup/script_template`}
          component={ScriptTemplateView}
        />
        <Route
          path={`${path}/setup/script_mapping`}
          component={ScriptMapping}
        />
        <Route
          path={`${path}/grading/:questionTemplateId`}
          component={MarkQuestionPage}
        />
        <Route path={`${path}/setup`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <SetupSubpage {...routeProps} />
              <BottomNav />
            </>
          )}
        </Route>
        <Route path={`${path}/grading`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <GradingSubpage />
              <BottomNav />
            </>
          )}
        </Route>
        <Route path={`${path}/scripts`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <ScriptsSubpage />
              <BottomNav />
            </>
          )}
        </Route>
      </Switch>
    </PaperProvider>
  );
};

export default PaperView;
