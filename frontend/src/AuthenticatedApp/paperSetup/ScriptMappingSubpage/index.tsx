import React, { useState } from "react";

import { Paper, Container, Tab, Tabs } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TabPanel from "../../../components/tables/TabPanel";
import ScriptsTable from "../components/tables/ScriptsTable";
import Header from "../components/PaperSetupHeader";
import StudentsTable from "../components/tables/StudentsTable";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    tabContainer: {
      flexGrow: 1,
      borderRadius: 0
    }
  })
);

const ScriptMapping: React.FC = () => {
  const classes = useStyles();

  const [tabValue, setTabValue] = useState(0);
  const handleChange = (event, newValue) => setTabValue(newValue);

  return (
    <>
      <Header title="Map scripts to students" />
      <Paper className={classes.tabContainer}>
        <Container maxWidth={false}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Scripts" />
            <Tab label="Students" />
          </Tabs>
        </Container>
      </Paper>
      <Container maxWidth={false} className={classes.container}>
        <TabPanel value={tabValue} index={0}>
          <ScriptsTable />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <StudentsTable />
        </TabPanel>
      </Container>
    </>
  );
};

export default ScriptMapping;
