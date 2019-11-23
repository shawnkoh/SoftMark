import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Container,
  Grid,
  Hidden,
  IconButton,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { PaperData } from "backend/src/types/papers";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import api from "../../api";
import RoundedButton from "../../components/buttons/RoundedButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PaperUserRole } from "../../types/paperUsers";
import AddPaperModal from "./components/AddPaperModal";
import Header from "./components/PaperIndexHeader";

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  marginSmall: {
    marginTop: theme.spacing(2)
  },
  grow: {
    flexGrow: 1
  },
  cardGrid: {
    padding: theme.spacing(2)
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  }
}));

const PaperIndex: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const toggleRefreshFlag = () => setRefreshFlag(refreshFlag + 1);
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [isOpenAddPaperDialog, setOpenAddPaperDialog] = useState(false);
  const toggleOpenAddPaperDialog = () =>
    setOpenAddPaperDialog(!isOpenAddPaperDialog);

  useEffect(() => {
    api.papers
      .getPapers()
      .then(resp => {
        setPapers(resp.data.papers);
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
        <Container maxWidth={false} className={classes.container}>
          <Box display="flex" alignItems="center">
            <Typography variant="h4" className={classes.grow}>
              Your Papers
            </Typography>
            <Hidden smDown>
              <RoundedButton
                onClick={toggleOpenAddPaperDialog}
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
              >
                Add Paper
              </RoundedButton>
            </Hidden>
          </Box>
          <Grid container spacing={2} className={classes.marginSmall}>
            <Hidden mdUp>
              <Grid item xs={12}>
                <RoundedButton
                  onClick={toggleOpenAddPaperDialog}
                  variant="outlined"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Add Paper
                </RoundedButton>
              </Grid>
            </Hidden>
            {papers.map(paper => (
              <Grid key={paper.id} item xs={12}>
                <Card>
                  <CardActionArea
                    onClick={() => {
                      switch (paper.role) {
                        case PaperUserRole.Owner:
                          history.push(`/papers/${paper.id}/setup`);
                          break;
                        case PaperUserRole.Marker:
                          history.push(`/papers/${paper.id}/grading`);
                          break;
                        case PaperUserRole.Student:
                          history.push(`/papers/${paper.id}`);
                          break;
                      }
                    }}
                  >
                    <Grid
                      container
                      direction="row"
                      justify="space-between"
                      alignItems="center"
                      spacing={2}
                      className={classes.cardGrid}
                    >
                      <Grid item className={classes.grow}>
                        <Typography variant="h6">{paper.name}</Typography>
                      </Grid>
                      <Grid item>
                        <Chip color="primary" label={paper.role} />
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle1">
                          {`Created on ${format(
                            new Date(paper.createdAt),
                            "d MMM yyyy"
                          )}`}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <IconButton
                          color="primary"
                          edge="end"
                          aria-label={`go to ${paper.name}`}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
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

export default PaperIndex;
