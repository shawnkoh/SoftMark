import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Link, Route, Switch } from "react-router-dom";
import api from "../../../api";
import { makeStyles } from "@material-ui/core/styles";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Button, Grid, Typography, IconButton } from "@material-ui/core";
import { Check, People, Person, Settings } from "@material-ui/icons";
import Add from "@material-ui/icons/Add";
import AddMarkerModal from "../components/modals/AddMarkerModal";
import { PaperData } from "backend/src/types/papers";
import { PaperUserData } from "../../../types/paperUsers";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import SetupSubpage from "../subpages/Setup";

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

const ACCOUNT = "account";
const SET_UP = "setup";
const GRADING = "grading";
const STUDENTS = "students";

const PaperView: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [
    currentPaperUser,
    setCurrentPaperUser
  ] = useState<PaperUserData | null>(null);
  const [value, setValue] = React.useState(SET_UP);

  //const [scripts, setScripts] = useState<ScriptListData[]>([]);
  //const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);
  const [isOpenAddMarkerDialog, setOpenAddMarkerDialog] = useState(false);
  const toggleOpenAddMarkerDialog = () =>
    setOpenAddMarkerDialog(!isOpenAddMarkerDialog);

  const postScript = (email: string, file) => {
    api.scripts.postScript(paper_id, email, file);
  };

  useEffect(() => {
    api.papers
      .getPaper(paper_id)
      .then(resp => {
        const data = resp.data;
        setCurrentPaperUser(data.currentPaperUser);
        setPaper(data.paper);
      })
      .finally(() => setIsLoading(false));
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!paper) {
    return <>The paper does not exist.</>;
  }

  if (!currentPaperUser) {
    return <>You are not allowed to view this paper.</>;
  }

  // Generic routes
  const accountsRoutePath = `/papers/:paper_id/${ACCOUNT}`;
  const accountsRoute = (
    <Route exact path={accountsRoutePath}>
      <div />
    </Route>
  );
  const setupRoutePath = `/papers/:paper_id/${SET_UP}`;
  const setupRoute = (
    <Route exact path={setupRoutePath}>
      <SetupSubpage paper={paper} toggleRefresh={toggleRefreshFlag} />
    </Route>
  );
  const gradingRoutePath = `/papers/:paper_id/${GRADING}`;
  const gradingRoute = (
    <Route exact path={gradingRoutePath}>
      <div />
    </Route>
  );
  const studentsRoutePath = `/papers/:paper_id/${STUDENTS}`;
  const studentsRoute = (
    <Route exact path={studentsRoutePath}>
      <div />
    </Route>
  );

  return (
    <>
      <Switch>
        {accountsRoute}
        {setupRoute}
        {gradingRoute}
        {studentsRoute}
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
          to={accountsRoutePath}
          value={ACCOUNT}
          label="Account"
          classes={{
            label: value === ACCOUNT ? classes.labelOn : classes.labelOff
          }}
          icon={<Person className={classes.navIcon} />}
        />
        <BottomNavigationAction
          component={Link}
          to={setupRoutePath}
          value={SET_UP}
          label="Set up"
          classes={{
            label: value === SET_UP ? classes.labelOn : classes.labelOff
          }}
          icon={<Settings className={classes.navIcon} />}
        />
        <BottomNavigationAction
          component={Link}
          to={gradingRoutePath}
          value={GRADING}
          label="Grading"
          classes={{
            label: value === GRADING ? classes.labelOn : classes.labelOff
          }}
          icon={<Check className={classes.navIcon} />}
        />
        <BottomNavigationAction
          component={Link}
          to={studentsRoutePath}
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
            <DropAreaBase
              accept={".pdf"}
              clickable
              multiple
              onSelectFiles={files => {
                Object.keys(files).forEach(key => {
                  postScript("ooimingsheng@gmail.com", files[key]);
                });
              }}
            >
              <Button variant="outlined" fullWidth>
                Upload
              </Button>
            </DropAreaBase>
          </Grid>
        </Grid>
      </main>
      <BottomNav />
    </>
  );*/
};

export default withRouter(PaperView);
