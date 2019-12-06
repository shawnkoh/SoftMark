import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import Check from "@material-ui/icons/Check";
import People from "@material-ui/icons/People";
import Settings from "@material-ui/icons/Settings";
import { ScriptListData } from "backend/src/types/scripts";
import usePaper from "contexts/PaperContext";
import { ScriptsAndStudentsProvider } from "contexts/ScriptsAndStudentsContext";
import { ScriptTemplateProvider } from "contexts/ScriptTemplateContext";
import React, { useEffect, useState } from "react";
import { Redirect, RouteComponentProps, withRouter } from "react-router";
import { Link, Route, Switch } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PaperUserRole } from "../../types/paperUsers";
import DownloadAllScriptsPage from "../DownloadScriptsPages/DownloadAllScriptsPage";
import DownloadSingleScriptPage from "../DownloadScriptsPages/DownloadSingleScriptPage";
import GradingPage, { MarkQuestionSubpage } from "../paperGrading";
import ScriptIndexPage, {
  ScriptMarkSubpage,
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
  const scriptMarkRoute = (
    <Route
      path={`${path}/${SCRIPTS}/:scriptId/mark/:questionTemplateId`}
      component={ScriptMarkSubpage}
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
          <ScriptIndexPage />
          <BottomNav />
        </>
      )}
    </Route>
  );
  const studentRedirectRoute = (
    <Route path={`${path}`} component={StudentRedirectToScriptView} />
  );
  const downloadAllScriptsRoute = (
    <Route
      exact
      path={`${path}/save_scripts`}
      component={DownloadAllScriptsPage}
    />
  );
  const downloadSingleScriptRoute = (
    <Route
      exact
      path={`${path}/${SCRIPTS}/:scriptId/save_script`}
      component={DownloadSingleScriptPage}
    />
  );

  return (
    <>
      {role === PaperUserRole.Student && (
        <Switch>
          {scriptViewRoute}
          {studentRedirectRoute}
        </Switch>
      )}

      {(role === PaperUserRole.Owner || role === PaperUserRole.Marker) && (
        <ScriptTemplateProvider>
          <ScriptsAndStudentsProvider>
            {role === PaperUserRole.Owner && (
              <Switch>
                {downloadAllScriptsRoute}
                {downloadSingleScriptRoute}
                {scriptMarkRoute}
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
                {downloadAllScriptsRoute}
                {downloadSingleScriptRoute}
                {scriptMarkRoute}
                {markQuestionRoute}
                {scriptViewRoute}
                {gradingRoute}
                {scriptsListingRoute}
              </Switch>
            )}
          </ScriptsAndStudentsProvider>
        </ScriptTemplateProvider>
      )}
    </>
  );
};

export default withRouter(PaperView);

// TODO: Handle this better. For now, there is only one script per student so this is ok.
const StudentRedirectToScriptView: React.FC<RouteComponentProps> = ({
  match
}) => {
  const paper = usePaper();
  const [isLoading, setLoading] = useState(true);
  const [scripts, setScripts] = useState<ScriptListData[]>([]);

  useEffect(() => {
    const getScripts = async () => {
      try {
        const response = await api.scripts.getScripts(paper.id);
        const { scripts } = response.data;
        setScripts(scripts);
      } catch (error) {
        toast.error(
          "An error occured while trying to load your scripts. Please try refreshing the page. Otherwise email shawnkoh@me.com"
        );
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    getScripts();
  }, [paper]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Redirect to={`/papers/${paper.id}/${SCRIPTS}/${scripts[0].id}`} />;
};
