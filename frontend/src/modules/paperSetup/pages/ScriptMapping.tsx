import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { PaperData } from "backend/src/types/papers";
import { PaperUserListData } from "backend/src/types/paperUsers";
import { ScriptListData } from "backend/src/types/scripts";

import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Tab, Tabs } from "@material-ui/core";
import ScriptsTable from "../components/tables/ScriptsTable";
import TabPanel from "../../../components/tables/TabPanel";
import Header from "../components/headers/PaperSetupHeader";
import StudentsTable from "../components/tables/StudentsTable";
import api from "../../../api";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

interface OwnProps {
  paper: PaperData;
}

type Props = OwnProps & RouteComponentProps;

const ScriptMapping: React.FC<Props> = ({ paper, match: { params } }) => {
  const classes = useStyles();

  const [tabValue, setTabValue] = React.useState(0);
  const handleChange = (event, newValue) => setTabValue(newValue);

  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);
  const [refreshScriptsFlag, setRefreshScriptsFlag] = useState(true);
  const refreshScripts = () => setRefreshScriptsFlag(!refreshScriptsFlag);

  const [students, setStudents] = useState<PaperUserListData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [refreshStudentsFlag, setRefreshStudentsFlag] = useState(true);
  const refreshStudents = () => setRefreshStudentsFlag(!refreshStudentsFlag);

  const getScripts = async (paperId: number) => {
    const data = await api.scripts.getScripts(paperId);
    setScripts(data || []);
  };

  useEffect(() => {
    getScripts(paper.id);
    setIsLoadingScripts(false);
  }, [refreshScriptsFlag]);

  return (
    <>
      <Header paper={paper} title="Mapping of scripts to nominal roll" />
      <div>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="Scripts" />
          <Tab label="Students" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ScriptsTable
            paper={paper}
            isLoadingScripts={isLoadingScripts}
            scripts={scripts}
            refreshScripts={refreshScripts}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <StudentsTable
            paper={paper}
            students={students}
            refreshScripts={refreshScripts}
            refreshStudents={refreshStudents}
            isLoadingStudents={isLoadingStudents}
            isLoadingScripts={isLoadingScripts}
          />
        </TabPanel>
      </div>
    </>
  );
};

export default withRouter(ScriptMapping);
