import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../api";
import { PaperData } from "backend/src/types/papers";
import { PaperUserListData } from "backend/src/types/paperUsers";
import { ScriptListData } from "backend/src/types/scripts";

import { Container, Tab, Tabs } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import TabPanel from "../../components/tables/TabPanel";
import ScriptsTable from "./components/tables/ScriptsTable";
import Header from "./components/headers/PaperSetupHeader";
import StudentsTable from "./components/tables/StudentsTable";

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

  return (
    <>
      <Header
        paper={paper}
        title="Map student scripts to student list / nominal roll"
      />
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
          <ScriptsTable paper={paper} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <StudentsTable paper={paper} />
        </TabPanel>
      </div>
    </>
  );
};

export default withRouter(ScriptMapping);
