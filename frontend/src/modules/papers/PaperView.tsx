import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter, useRouteMatch } from "react-router";
import { Link, Route, Switch } from "react-router-dom";

import api from "../../api";
import { PaperData } from "backend/src/types/papers";
import { PaperUserData } from "../../types/paperUsers";

import { makeStyles } from "@material-ui/core/styles";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Check, People, Person, Settings } from "@material-ui/icons";

import LoadingSpinner from "../../components/LoadingSpinner";
import AddMarkerModal from "./components/modals/AddMarkerModal";
import SetupSubpage from "./subpages/Setup";

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

const TEAM = "team";
const SET_UP = "setup";
const GRADING = "grading";
const STUDENTS = "students";

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
  const [value, setValue] = React.useState(SET_UP);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);

  //const [scripts, setScripts] = useState<ScriptListData[]>([]);
  //const [pages, setPages] = useState<string[]>([]);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);
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
      <Switch>
        <Route exact path={path}>
          <h3>Exact</h3>
        </Route>
        <Route path={`${path}/users`}>
          <h3>Users</h3>
        </Route>
        <Route path={`${path}/setup`}>
          <SetupSubpage paper={paper} toggleRefresh={toggleRefreshFlag} />
        </Route>
        <Route path={`${path}/grading`}>
          <h3>Grading</h3>
        </Route>
        <Route path={`${path}/students`}>
          <h3>Students</h3>
        </Route>
      </Switch>

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
          to={`${url}/${TEAM}`}
          value={TEAM}
          label="Team"
          classes={{
            label: value === TEAM ? classes.labelOn : classes.labelOff
          }}
          icon={<Person className={classes.navIcon} />}
        />
        <BottomNavigationAction
          component={Link}
          to={`${url}/${SET_UP}`}
          value={SET_UP}
          label="Set up"
          classes={{
            label: value === SET_UP ? classes.labelOn : classes.labelOff
          }}
          icon={<Settings className={classes.navIcon} />}
        />
        <BottomNavigationAction
          component={Link}
          to={`${url}/${GRADING}`}
          value={GRADING}
          label="Grading"
          classes={{
            label: value === GRADING ? classes.labelOn : classes.labelOff
          }}
          icon={<Check className={classes.navIcon} />}
        />
        <BottomNavigationAction
          component={Link}
          to={`${url}/${STUDENTS}`}
          value={STUDENTS}
          label="Students"
          classes={{
            label: value === STUDENTS ? classes.labelOn : classes.labelOff
          }}
          icon={<People className={classes.navIcon} />}
        />
      </BottomNavigation>
    </>
  );
  /*
  

  const { paperUsers } = paper;

  return (
    <>
      <main className={classes.content}>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
          spacing={2}
        >
          <Grid
            key={paper.id}
            item
            xs={12}
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid
              item
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Typography variant="h4">{paper.name}</Typography>
              <EditPaperModal
                paper={paper}
                visible={isOpenEditPaperDialog}
                toggleVisibility={toggleOpenEditPaperDialog}
                toggleRefresh={toggleRefreshFlag}
              />
              <IconButton onClick={toggleOpenEditPaperDialog}>
                <Edit />
              </IconButton>
            </Grid>
            <Grid item>
              <Typography variant="subtitle1">
                {true && (
                  <>
                    {`${BULLET_POINT} Upload documents`}
                    <br />
                  </>
                )}
                {true && (
                  <>
                    {`${BULLET_POINT} Set up template`}
                    <br />
                  </>
                )}
                {true && (
                  <>
                    {`${BULLET_POINT} Allocate questions`}
                    <br />
                  </>
                )}
              </Typography>
            </Grid>
          </Grid>
          <div className={classes.divider} />
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="center"
            spacing={4}
          >
            {rowDetails.map(row => createGridRow(row))}
          </Grid>

          {paperUsers.map(paperUser => {
            return (
              <Grid key={paperUser.id} item xs={12} onClick={() => {}}>
                {paperUser.user.email}
              </Grid>
            );
          })}
          <Grid item xs={12}>
            <Button
              onClick={toggleOpenAddMarkerDialog}
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<Add />}
            >
              Add Marker
            </Button>
            <AddMarkerModal
              paperId={paper_id}
              visible={isOpenAddMarkerDialog}
              toggleVisibility={toggleOpenAddMarkerDialog}
              toggleRefresh={toggleRefreshFlag}
            />
          </Grid>
          <Grid item xs={12}>
            
          </Grid>
        </Grid>
      </main>
      <BottomNav />
    </>
  );*/
};

export default withRouter(PaperView);
