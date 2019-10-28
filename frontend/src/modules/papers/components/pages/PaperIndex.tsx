import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { AppState } from "../../../../types/store";
import api from "../../../../api";
import { AxiosResponse } from "axios";
import { Button, Grid, Typography } from "@material-ui/core";
import LoadingIcon from "../../../../components/icons/LoadingIcon";
import AddButton from "../../../../components/buttons/AddButton";
import Header from "../headers/PaperIndexHeader";
import { PaperListData } from "backend/src/types/papers";
import AddPaperModal from "../modals/AddPaperModal";

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
    return <LoadingIcon />;
  }

  return (
    <div>
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
            <AddButton text={"Add Paper"} onClick={toggleOpenAddPaperDialog} />
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
