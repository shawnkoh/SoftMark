import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import Check from "@material-ui/icons/Check";
import People from "@material-ui/icons/People";
import Settings from "@material-ui/icons/Settings";
import usePaper from "contexts/PaperContext";
import React, { useState } from "react";
import { Redirect, RouteComponentProps, useRouteMatch } from "react-router";
import { Link, Route, Switch } from "react-router-dom";
import { PaperUserRole } from "../../types/paperUsers";
import DownloadAsPdfPage from "../DownloadAsPdfPage";
import GradingPage, { MarkQuestionSubpage } from "../paperGrading";
import ScriptsPage, {
  ScriptEditSubpage,
  ScriptViewSubpage
} from "../paperScripts";
import SetupPage, {
  QuestionAllocationSubpage,
  ScriptMappingSubpage,
  ScriptTemplateSubpage
} from "../paperSetup";
import PaperViewHeader from "./components/PaperViewHeader";
import useStyles from "./styles";

const SETUP = "setup";
const GRADING = "grading";
const SCRIPTS = "scripts";

const PaperView: React.FC = () => {
  const classes = useStyles();
  // https://reacttraining.com/react-router/web/example/nesting
  const { path, url } = useRouteMatch()!;
  const { pathname } = location;

  const paper = usePaper();
  const { role } = paper;

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
      {role === PaperUserRole.Owner && (
        <BottomNavigationAction
          component={Link}
          to={`${url}/${SETUP}`}
          value={SETUP}
          label="Setup"
          icon={<Settings />}
        />
      )}
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

  const setupRoute = (
    <Route exact path={`${path}/${SETUP}`}>
      {(routeProps: RouteComponentProps) => (
        <>
          <PaperViewHeader />
          <SetupPage {...routeProps} />
          <BottomNav />
        </>
      )}
    </Route>
  );
  const questionAllocationRoute = (
    <Route path={`${path}/${SETUP}/allocate`}>
      <QuestionAllocationSubpage />
    </Route>
  );
  const setupScriptTemplateRoute = (
    <Route path={`${path}/${SETUP}/template`}>
      <ScriptTemplateSubpage />
    </Route>
  );
  const scriptMappingRoute = (
    <Route path={`${path}/${SETUP}/map`}>
      <ScriptMappingSubpage />
    </Route>
  );
  const markQuestionRoute = (
    <Route path={`${path}/${GRADING}/:questionTemplateId`}>
      <MarkQuestionSubpage />
    </Route>
  );
  const scriptViewRoute = (
    <Route path={`${path}/${SCRIPTS}/:scriptId`}>
      <ScriptViewSubpage />
    </Route>
  );
  const scriptEditRoute = (
    <Route path={`${path}/${SCRIPTS}/:scriptId/mark`}>
      <ScriptEditSubpage />
    </Route>
  );
  const gradingRoute = (
    <Route path={`${path}/${GRADING}`}>
      {(routeProps: RouteComponentProps) => (
        <>
          <PaperViewHeader />
          <GradingPage />
          <BottomNav />
        </>
      )}
    </Route>
  );
  const scriptsListingRoute = (
    <Route path={`${path}/${SCRIPTS}`}>
      {(routeProps: RouteComponentProps) => (
        <>
          <PaperViewHeader />
          <ScriptsPage />
          <BottomNav />
        </>
      )}
    </Route>
  );
  const studentRedirectRoute = (
    <Route path={`${path}`}>
      <StudentRedirectToScriptView />
    </Route>
  );

  return (
    <>
      {role === PaperUserRole.Owner && (
        <Switch>
          {scriptEditRoute}
          {questionAllocationRoute}
          {setupScriptTemplateRoute}
          {scriptMappingRoute}
          {scriptViewRoute}
          {markQuestionRoute}
          {setupRoute}
          {gradingRoute}
          {scriptsListingRoute}
          <Route path={`${path}/save_scripts`}>
            <DownloadAsPdfPage />
          </Route>
        </Switch>
      )}
      {role === PaperUserRole.Marker && (
        <Switch>
          {scriptEditRoute}
          {markQuestionRoute}
          {scriptViewRoute}
          {gradingRoute}
          {scriptsListingRoute}
        </Switch>
      )}
      {role === PaperUserRole.Student && (
        <Switch>
          {scriptViewRoute}
          {studentRedirectRoute}
        </Switch>
      )}
    </>
  );
};

export default PaperView;

const StudentRedirectToScriptView: React.FC = () => {
  const paper = usePaper();
  const role = paper.role;

  //TODO: get scriptID of the student

  return role === PaperUserRole.Student ? (
    <Redirect to={`/papers/${paper.id}/${SCRIPTS}/scriptId`} />
  ) : (
    <div />
  );
};
