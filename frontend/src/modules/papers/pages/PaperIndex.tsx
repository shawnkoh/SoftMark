import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { PaperListData } from "backend/src/types/papers";
import api from "../../../api";

import { Button, Grid, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import Header from "../components/headers/PaperIndexHeader";
import AddPaperModal from "../components/modals/AddPaperModal";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import ThemedButton from "../../../components/buttons/ThemedButton";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center"
  },
  centralisedList: {
    marginTop: 30,
    display: "inline-block"
  },
  content: {
    marginTop: 64,
    marginLeft: 100,
    marginRight: 100,
    minWidth: 500,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3), // padding between content and top and side bars
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  }
}));

type Props = RouteComponentProps;

const PaperIndex: React.FC<Props> = props => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);
  const [papers, setPapers] = useState<PaperListData[]>([]);
  const [isOpenAddPaperDialog, setOpenAddPaperDialog] = useState(false);
  const toggleOpenAddPaperDialog = () =>
    setOpenAddPaperDialog(!isOpenAddPaperDialog);

  useEffect(() => {
    api.papers
      .getPapers()
      .then(resp => {
        setPapers(resp.data.paper);
      })
      .finally(() => setIsLoading(false));
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header />
      <main className={classes.content}>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
          spacing={4}
        >
          {papers.map(paper => {
            return (
              <Grid
                key={paper.id}
                item
                xs={12}
                container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
              >
                <Grid item xs={4}>
                  <Typography variant="h6">
                    {paper.name}
                  </Typography>
                </Grid>
                <Grid item xs={6} container direction="row" justify="flex-end">
                  <Typography variant="body1">
                    {true ? "Set up completed" : "Set up is incomplete"}
                  </Typography>
                </Grid>
                <Grid item xs={2} container direction="row" justify="flex-end">
                  <ThemedButton
                    label="Settings"
                    size="small"
                    onClick={() => {
                      props.history.push(`/papers/${paper.id}`);
                    }}
                    filled={true}
                  />
                </Grid>
              </Grid>
            );
          })}
          <Grid item xs={12} container direction="row" justify="center">
            <Button
              onClick={toggleOpenAddPaperDialog}
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<Add />}
              fullWidth
            >
              Add Paper
            </Button>
            <AddPaperModal
              visible={isOpenAddPaperDialog}
              toggleVisibility={toggleOpenAddPaperDialog}
              toggleRefresh={toggleRefreshFlag}
            />
          </Grid>
        </Grid>
      </main>
    </>
  );
};

export default withRouter(PaperIndex);
