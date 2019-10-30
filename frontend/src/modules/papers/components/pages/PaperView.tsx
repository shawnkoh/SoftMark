import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { PDFtoIMG } from "react-pdf-to-image";
import api from "../../../../api";
import { makeStyles } from "@material-ui/core/styles";
import { Button, CssBaseline, Grid, Typography } from "@material-ui/core";
import LoadingIcon from "../../../../components/icons/LoadingIcon";
import AddButton from "../../../../components/buttons/AddButton";
import Header from "../headers/PaperViewHeader";
import SideBar from "../sidebars/Sidebar";
import AddMarkerModal from "../modals/AddMarkerModal";
import { PaperData } from "backend/src/types/papers";
import {
  ScriptPostData,
  ScriptListData,
  ScriptData
} from "backend/src/types/scripts";
import { drawerWidth } from "../sidebars/Sidebar";
import { DropAreaBase } from "material-ui-file-dropzone";
<<<<<<< HEAD
=======
import BottomNav from "../footers/BottomNav";
>>>>>>> master

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3)
  }
}));

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
    return <LoadingIcon />;
  }

  if (!paper) {
    return <>The paper does not exist</>;
  }

  const { paperUsers } = paper;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Header paper={paper} title={"Team"} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
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

        <BottomNav />
      </main>
    </div>
  );
};

export default withRouter(PaperView);
