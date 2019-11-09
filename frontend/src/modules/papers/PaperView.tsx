import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter, useRouteMatch } from "react-router";
import { Link, Route, Switch } from "react-router-dom";

import api from "../../api";
import { PaperData } from "backend/src/types/papers";
import { PaperUserData } from "../../types/paperUsers";

import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Check, People, Person, Settings } from "@material-ui/icons";
import lightBlue from "@material-ui/core/colors/lightBlue";

import LoadingSpinner from "../../components/LoadingSpinner";
import GradingSubpage from "./subpages/Grading";
import SetupSubpage from "./subpages/Setup";
import ScriptsSubpage from "./subpages/Scripts";
import PaperViewHeader from "./components/headers/PaperViewHeader";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    navBar: {
      width: "100%",
      position: "fixed",
      bottom: 0,
      backgroundColor: lightBlue[50]
    }
  })
);

type Props = RouteComponentProps;

const TEAM = "team";
const SETUP = "setup";
const GRADING = "grading";
const SCRIPTS = "scripts";

const PaperView: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();
  // https://reacttraining.com/react-router/web/example/nesting
  const { path, url } = useRouteMatch()!;
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [
    currentPaperUser,
    setCurrentPaperUser
  ] = useState<PaperUserData | null>(null);
  const [value, setValue] = useState(SETUP);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refreshPaper = () => setRefreshFlag(refreshFlag + 1);
  const [isOpenAddMarkerDialog, setOpenAddMarkerDialog] = useState(false);
  const toggleOpenAddMarkerDialog = () =>
    setOpenAddMarkerDialog(!isOpenAddMarkerDialog);

  const getPaper = async (paper_id: number) => {
    const data = await api.papers.getPaper(paper_id);
    if (!data) {
      return;
    }
    setCurrentPaperUser(data.currentPaperUser);
    setPaper(data.paper);
    setIsLoading(false);
  };

  useEffect(() => {
    getPaper(paper_id);
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!paper || !currentPaperUser) {
    return <>The paper does not exist.</>;
  }

  return (
    <>
      <PaperViewHeader paper={paper} refreshPaper={refreshPaper} />
      <Switch>
        <Route exact path={path}>
          <h3>Exact</h3>
        </Route>
        <Route path={`${path}/users`}>
          <h3>Users</h3>
        </Route>
        <Route path={`${path}/setup`}>
          <SetupSubpage paper={paper} />
        </Route>
        <Route path={`${path}/grading`}>
          <GradingSubpage paper={paper} />
        </Route>
        <Route path={`${path}/scripts`}>
          <ScriptsSubpage paper={paper} />
        </Route>
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
          to={`${url}/${TEAM}`}
          value={TEAM}
          label="Team"
          icon={<Person />}
        />
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
    </>
  );
};

export default withRouter(PaperView);
