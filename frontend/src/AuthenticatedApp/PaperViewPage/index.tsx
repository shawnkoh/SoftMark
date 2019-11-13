import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link, Route, Switch } from "react-router-dom";

import { PaperProvider } from "../../contexts/PaperContext";

import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import Check from "@material-ui/icons/Check";
import People from "@material-ui/icons/People";
import Settings from "@material-ui/icons/Settings";

import useStyles from "./styles";
import PaperViewHeader from "./components/PaperViewHeader";
import SetupPage, {
  ScriptMappingSubpage,
  QuestionAllocationSubpage,
  ScriptTemplateSubpage
} from "../paperSetup";
import GradingPage, { MarkQuestionSubpage } from "../paperGrading";
import ScriptsPage, { ScriptViewSubpage } from "../paperScripts";

const SETUP = "setup";
const GRADING = "grading";
const SCRIPTS = "scripts";

const PaperView: React.FC<RouteComponentProps> = ({ location, match }) => {
  const classes = useStyles();
  // https://reacttraining.com/react-router/web/example/nesting
  const { path, url } = match;
  const { pathname } = location;

  const getTabValueFromPathname = pathname => {
    if (pathname.includes(SETUP)) {
      return SETUP;
    } else if (pathname.includes(GRADING)) {
      return GRADING;
    } else if (pathname.includes(SCRIPTS)) {
      return SCRIPTS;
    } else {
      return SETUP;
    }
  };
  const [value, setValue] = useState(getTabValueFromPathname(pathname));

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
        label="Marking"
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
          path={`${path}/${SETUP}/allocate`}
          component={QuestionAllocationSubpage}
        />
        <Route
          path={`${path}/${SETUP}/template`}
          component={ScriptTemplateSubpage}
        />
        <Route path={`${path}/${SETUP}/map`} component={ScriptMappingSubpage} />
        <Route
          path={`${path}/${GRADING}/:questionTemplateId`}
          component={MarkQuestionSubpage}
        />
        <Route
          path={`${path}/${SCRIPTS}/:scriptId`}
          component={ScriptViewSubpage}
        />
        <Route path={`${path}/${SETUP}`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <SetupPage {...routeProps} />
              <BottomNav />
            </>
          )}
        </Route>
        <Route path={`${path}/${GRADING}`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <GradingPage />
              <BottomNav />
            </>
          )}
        </Route>
        <Route path={`${path}/${SCRIPTS}`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <ScriptsPage />
              <BottomNav />
            </>
          )}
        </Route>
      </Switch>
    </PaperProvider>
  );
};

export default PaperView;
