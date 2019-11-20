import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import React, { useState, useEffect } from "react";
import { RouteComponentProps, withRouter, Redirect } from "react-router";
import { Link, Route, Switch } from "react-router-dom";
import api from "../../api";

import usePaper from "contexts/PaperContext";

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
import ScriptsPage, {
  ScriptViewSubpage,
  ScriptEditSubpage
} from "../paperScripts";
import { PaperUserRole } from "../../types/paperUsers";
import LoadingSpinner from "../../components/LoadingSpinner";

const SETUP = "setup";
const GRADING = "grading";
const SCRIPTS = "scripts";

const PaperView: React.FC<RouteComponentProps> = ({ location, match }) => {
  const classes = useStyles();
  // https://reacttraining.com/react-router/web/example/nesting
  const { path, url } = match;
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
    <Route
      path={`${path}/${SETUP}/allocate`}
      component={QuestionAllocationSubpage}
    />
  );
  const setupScriptTemplateRoute = (
    <Route
      path={`${path}/${SETUP}/template`}
      component={ScriptTemplateSubpage}
    />
  );
  const scriptMappingRoute = (
    <Route path={`${path}/${SETUP}/map`} component={ScriptMappingSubpage} />
  );
  const markQuestionRoute = (
    <Route
      path={`${path}/${GRADING}/:questionTemplateId`}
      component={MarkQuestionSubpage}
    />
  );
  const scriptViewRoute = (
    <Route
      path={`${path}/${SCRIPTS}/:scriptId`}
      component={ScriptViewSubpage}
    />
  );
  const scriptEditRoute = (
    <Route
      path={`${path}/${SCRIPTS}/:scriptId/mark`}
      component={ScriptEditSubpage}
    />
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
    <Route path={`${path}`} component={StudentRedirectToScriptView} />
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

export default withRouter(PaperView);

const StudentRedirectToScriptView: React.FC<RouteComponentProps> = ({
  match
}) => {
  const { path } = match;
  const paper = usePaper();
  const role = paper.role;
  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);

  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const getScriptTemplate = async () => {
    const scriptTemplate = await api.scriptTemplates.getScriptTemplate(
      paper.id
    );
    setScriptTemplate(scriptTemplate);
    setIsLoadingScriptTemplate(false);
  };

  useEffect(() => {
    getScriptTemplate();
  }, []);

  if (isLoadingScriptTemplate) {
    return <LoadingSpinner />;
  }

  return role === PaperUserRole.Student && scriptTemplate ? (
    <Redirect to={`/papers/${paper.id}/${SCRIPTS}`} />
  ) : (
    <div />
  );
};
