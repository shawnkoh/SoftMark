import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import clsx from "clsx";

import { PaperListData } from "backend/src/types/papers";
import api from "../../../api";
import { dateToString } from "../../../utils/date";

import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Paper
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

import Header from "../components/headers/PaperIndexHeader";
import AddPaperModal from "../components/modals/AddPaperModal";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import { RoundedButton } from "../../../components/buttons/StyledButtons";

const useStyles = makeStyles(theme => ({
  grid: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  cardItemGrow: {
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
      <main>
        <Container fixed maxWidth="md">
          <Grid container spacing={2} className={classes.grid}>
            {papers.map(paper => (
              <Grid item xs={12}>
                <Paper>
                  <Box display="flex" alignItems="center">
                    <Typography
                      variant="h5"
                      className={clsx(classes.cardItem, classes.cardItemGrow)}
                    >
                      {paper.name}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      className={classes.cardItem}
                    >
                      created on {dateToString(paper.createdAt)}
                    </Typography>
                    <Typography variant="body1" className={classes.cardItem}>
                      {true ? "Set up completed" : "Set up is incomplete"}
                    </Typography>
                    <RoundedButton
                      onClick={() => {
                        props.history.push(`/papers/${paper.id}`);
                      }}
                      size="small"
                      variant="contained"
                      color="primary"
                      className={classes.cardItem}
                    >
                      Settings
                    </RoundedButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
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
        </Container>
      </main>
    </>
  );
};

export default withRouter(PaperIndex);
