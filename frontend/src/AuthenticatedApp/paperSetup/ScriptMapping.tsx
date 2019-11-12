import { Tab, Tabs } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import TabPanel from "../../components/tables/TabPanel";
import Header from "./components/headers/PaperSetupHeader";
import ScriptsTable from "./components/tables/ScriptsTable";
import StudentsTable from "./components/tables/StudentsTable";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

const ScriptMapping: React.FC = () => {
  const classes = useStyles();

  const [tabValue, setTabValue] = React.useState(0);
  const handleChange = (event, newValue) => setTabValue(newValue);

  return (
    <>
      <Header title="Map student scripts to student list / nominal roll" />
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
          <ScriptsTable />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <StudentsTable />
        </TabPanel>
      </div>
    </>
  );
};

export default ScriptMapping;
