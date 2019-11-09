import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import clsx from "clsx";
import { format } from "date-fns";

import api from "../../api";
import { PaperListData } from "backend/src/types/papers";

import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  IconButton,
  Card,
  CardActionArea
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { makeStyles } from "@material-ui/core/styles";

import LoadingSpinner from "../../components/LoadingSpinner";
import Header from "./components/headers/PaperIndexHeader";
import AddPaperModal from "./components/modals/AddPaperModal";

const useStyles = makeStyles(theme => ({
  margin: {
    marginTop: theme.spacing(4)
  },
  grow: {
    flexGrow: 1
  },
  cardItem: {
    margin: theme.spacing(2)
  }
}));

type Props = RouteComponentProps;

const PaperIndex: React.FC<Props> = props => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const toggleRefreshFlag = () => setRefreshFlag(refreshFlag + 1);
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
      <main>
        <Container fixed>
          <Box display="flex" alignItems="center" className={classes.margin}>
            <Typography variant="h4" className={classes.grow}>
              Your Papers
            </Typography>
            <Button
              onClick={toggleOpenAddPaperDialog}
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<AddIcon />}
            >
              Add Paper
            </Button>
          </Box>
          <Grid container spacing={2} className={classes.margin}>
            {papers.map(paper => (
              <Grid key={paper.id} item xs={12}>
                <Card>
                  <CardActionArea
                    onClick={() => {
                      props.history.push(`/papers/${paper.id}/setup`);
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="h6"
                        className={clsx(classes.cardItem, classes.grow)}
                      >
                        {paper.name}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        className={classes.cardItem}
                      >
                        {`Created on ${format(
                          new Date(paper.createdAt),
                          "d MMM yyyy"
                        )}`}
                      </Typography>
                      <IconButton
                        color="primary"
                        edge="end"
                        className={classes.cardItem}
                        aria-label={`go to ${paper.name}`}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <AddPaperModal
            visible={isOpenAddPaperDialog}
            toggleVisibility={toggleOpenAddPaperDialog}
            toggleRefresh={toggleRefreshFlag}
          />
        </Container>
      </main>
    </>
  );
};

export default withRouter(PaperIndex);
