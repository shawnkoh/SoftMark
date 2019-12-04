import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography
} from "@material-ui/core";
import CloudDownload from "@material-ui/icons/CloudDownload";
import UploadIcon from "@material-ui/icons/CloudUpload";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import useScriptTemplate from "contexts/ScriptTemplateContext";
import MatchIcon from "mdi-material-ui/ArrowCollapse";
import React, { useState } from "react";
import RoundedButton from "../../../../components/buttons/RoundedButton";
import SearchBar from "../../../../components/fields/SearchBar";
import { TableColumn } from "../../../../components/tables/TableTypes";
import UploadScriptStudentMappingWrapper from "../../../../components/uploadWrappers/UploadScriptStudentMappingWrapper";
import UploadScriptsWrapper from "../../../../components/uploadWrappers/UploadScriptsWrapper";
import ScriptsTableRow from "./ScriptTableRow";
import useStyles from "./styles";

const ScriptsTable: React.FC = () => {
  const classes = useStyles();
  const { scriptTemplate } = useScriptTemplate();
  const { scripts } = useScriptsAndStudents();

  const [searchText, setSearchText] = useState("");

  const columns: TableColumn[] = [
    {
      name: "Script (filename)",
      key: "scripts"
    },
    {
      name: "Pages",
      key: "pages"
    },
    {
      name: "Student matriculation number",
      key: "students"
    },
    {
      name: "Correct mapping verification",
      key: "verified"
    },
    {
      name: "",
      key: ""
    }
  ];

  const unmatchedScriptsCount = scripts.filter(s => !s.studentId).length;

  const filteredScripts = scripts.filter(script => {
    const { filename, matriculationNumber } = script;
    const lowerCaseSearchText = searchText.toLowerCase();
    return (
      searchText === "" ||
      filename.toLowerCase().includes(lowerCaseSearchText) ||
      (matriculationNumber &&
        matriculationNumber.toLowerCase().includes(lowerCaseSearchText))
    );
  });

  return (
    <>
      <Typography variant="overline" className={classes.margin}>
        {`${scripts.length} script(s) in total ` +
          `(${unmatchedScriptsCount} unmatched scripts)`}
      </Typography>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={1}
        className={classes.margin}
      >
        <Grid item className={classes.grow}>
          <SearchBar
            value={""}
            placeholder="Search..."
            onChange={str => setSearchText(str)}
          />
        </Grid>
        <Grid item>
          <UploadScriptsWrapper>
            <RoundedButton
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
            >
              Upload scripts
            </RoundedButton>
          </UploadScriptsWrapper>
        </Grid>
        <Grid item>
          <UploadScriptStudentMappingWrapper>
            <Tooltip title="Match students to scripts">
              <RoundedButton
                variant="contained"
                color="primary"
                startIcon={<MatchIcon />}
              >
                Match
              </RoundedButton>
            </Tooltip>
          </UploadScriptStudentMappingWrapper>
        </Grid>
        <Grid item>
          <RoundedButton
            variant="contained"
            color="primary"
            startIcon={<CloudDownload />}
          >
            Export Unmatched
          </RoundedButton>
        </Grid>
        {/* <Grid item>
          <DeleteAllScriptsModal
            render={toggleModal => (
              <RoundedButton
                onClick={toggleModal}
                variant="contained"
                startIcon={<DeleteAllIcon />}
                className={classes.redButton}
              >
                Delete All
              </RoundedButton>
            )}
          />
        </Grid> */}
      </Grid>
      <Paper className={classes.tableWrapper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>
                  {column.isSortable ? (
                    <TableSortLabel
                      active={true}
                      direction={"desc"}
                      onClick={() => {}}
                    >
                      {column.name}
                    </TableSortLabel>
                  ) : (
                    column.name
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScripts.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No scripts found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {filteredScripts.map(script => (
              <ScriptsTableRow
                key={JSON.stringify(script)}
                scriptTemplatePagesCount={
                  scriptTemplate ? scriptTemplate.pageCount : -1
                }
                script={script}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default ScriptsTable;
