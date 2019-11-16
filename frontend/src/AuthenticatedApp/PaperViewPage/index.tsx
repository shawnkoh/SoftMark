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

import ScriptMapping from "../paperSetup/ScriptMappingPage";
import ScriptTemplateView from "../paperSetup/ScriptTemplateView";
import QuestionAllocationPage from "../paperSetup/QuestionAllocationPage";
import { MarkQuestionPage } from "../paperGrading";
import { ScriptViewPage } from "../paperScripts";

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
    } else if (pathname.includes(GRADING)) {
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
          path={`${path}/${SETUP}/question_allocation`}
          component={QuestionAllocationPage}
        />
        <Route
          path={`${path}/${SETUP}/script_template`}
          component={ScriptTemplateView}
        />
        <Route
          path={`${path}/${SETUP}/script_mapping`}
          component={ScriptMapping}
        />
        <Route
          path={`${path}/${GRADING}/:questionTemplateId`}
          component={MarkQuestionPage}
        />
        <Route
          path={`${path}/${SCRIPTS}/:scriptId`}
          component={ScriptViewPage}
        />
        <Route path={`${path}/${SETUP}`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <SetupSubpage {...routeProps} />
              <BottomNav />
            </>
          )}
        </Route>
        <Route path={`${path}/${GRADING}`}>
          {(routeProps: RouteComponentProps) => (
            <>
              <PaperViewHeader />
              <GradingSubpage />
              <BottomNav />
            </>
          )}
        </Route>
        <Route path={`${path}/${SCRIPTS}`}>
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
