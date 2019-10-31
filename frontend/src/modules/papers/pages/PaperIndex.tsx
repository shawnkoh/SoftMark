import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { AxiosResponse } from "axios";

import { PaperListData } from "backend/src/types/papers";
import { AppState } from "../../../types/store";
import api from "../../../api";

import {
  CircularProgress,
  CssBaseline,
  Button,
  Grid,
  Typography
} from "@material-ui/core";
import { Add } from "@material-ui/icons";
import Header from "../components/headers/PaperIndexHeader";
import AddPaperModal from "../components/modals/AddPaperModal";

type Props = RouteComponentProps;

const PaperIndex: React.FC<Props> = props => {
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
    return <CircularProgress />;
  }

  return (
    <div>
      <CssBaseline />
      <Header />
      <div>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
          spacing={2}
        >
          {papers.map(paper => {
            return (
              <Grid
                key={1}
                item
                xs={12}
                onClick={() => {
                  props.history.push(`/papers/${paper.id}`);
                }}
              >
                {paper.name} create component here
              </Grid>
            );
          })}
          <Grid item xs={12}>
            <Button
              onClick={toggleOpenAddPaperDialog}
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<Add />}
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
      </div>
    </div>
  );
};

export default withRouter(PaperIndex);
