import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { AppState } from "../../../../types/store";
import api from "../../../../api";
import { AxiosResponse } from "axios";
import { Button, Grid, Typography } from "@material-ui/core";
import LoadingIcon from "../../../../components/icons/LoadingIcon";
import AddButton from "../../../../components/buttons/AddButton";
import Header from "../headers/PaperViewHeader";
import { PaperData } from "backend/src/types/papers";
import AddMarkerModal from "../modals/AddMarkerModal";

type Props = RouteComponentProps;

const PaperView: React.FC<Props> = ({ match: { params } }) => {
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [isOpenAddMarkerDialog, setOpenAddMarkerDialog] = useState(false);
  const toggleOpenAddMarkerDialog = () =>
    setOpenAddMarkerDialog(!isOpenAddMarkerDialog);

  useEffect(() => {
    api.papers
      .getPaper(paper_id)
      .then(resp => {
        console.log(resp);
        setPaper(resp.data);
      })
      .finally(() => setIsLoading(false));
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingIcon />;
  }

  if (!paper) {
    return <>The paper does not exist</>;
  }

  const { paperUsers } = paper;

  return (
    <div>
      <Header paper={paper} title={"Team"} />
      <div>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
          spacing={2}
        >
          {paperUsers.map(paperUser => {
            return (
              <Grid key={1} item xs={12} onClick={() => {}}>
                {paperUser.user.email}
              </Grid>
            );
          })}
          <Grid item xs={12}>
            <AddButton
              text={"Add marker"}
              onClick={toggleOpenAddMarkerDialog}
            />
            <AddMarkerModal
              paperId={paper_id}
              visible={isOpenAddMarkerDialog}
              toggleVisibility={toggleOpenAddMarkerDialog}
              toggleRefresh={toggleRefreshFlag}
            />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default withRouter(PaperView);
