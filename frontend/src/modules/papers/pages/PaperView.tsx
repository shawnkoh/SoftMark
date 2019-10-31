import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { PDFtoIMG } from "react-pdf-to-image";
import api from "../../../api";
import { makeStyles } from "@material-ui/core/styles";
import { Button, CssBaseline, Grid, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import Header from "../components/headers/PaperViewHeader";
import SideBar from "../components/sidebars/Sidebar";
import AddMarkerModal from "../components/modals/AddMarkerModal";
import { PaperData } from "backend/src/types/papers";
import {
  ScriptPostData,
  ScriptListData,
  ScriptData
} from "backend/src/types/scripts";
import { drawerWidth } from "../components/sidebars/Sidebar";
import { DropAreaBase } from "material-ui-file-dropzone";
import BottomNav from "../components/footers/BottomNav";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: 20,
    marginLeft: 100,
    marginRight: 100,
    minWidth: 500,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3), // padding between content and top and side bars
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  divider: {
    marginTop: 50
  }
}));

const BULLET_POINT = `\u2022 `;

type Props = RouteComponentProps;

const PaperView: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [pages, setPages] = useState<string[]>([]);

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
        setPaper(resp.data.paper);
      })
      .finally(() => setIsLoading(false));

    api.scripts.getScripts(paper_id).then(resp => {
      setScripts(resp.data.script);
    });
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!paper) {
    return <>The paper does not exist</>;
  }

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
            onClick={() => {}}
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
            spacing={1}
          >
            <Grid item>
              <Typography variant="h4">{paper.name}</Typography>
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
  );
};

export default withRouter(PaperView);
