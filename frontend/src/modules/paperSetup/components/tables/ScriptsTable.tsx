import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../../api";
import { PaperData } from "backend/src/types/papers";
import { ScriptListData } from "backend/src/types/scripts";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { TableColumn } from "../../../../components/tables/TableTypes";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Tooltip,
  Paper
} from "@material-ui/core";
import Clear from "@material-ui/icons/Clear";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import UploadScriptsWrapper from "../../../../components/uploadWrappers/UploadScriptsWrapper";
import ScriptsTableRow from "./ScriptTableRow";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

interface OwnProps {
  paper: PaperData;
  scripts: ScriptListData[];
  isLoadingScripts: boolean;
  refreshScripts: () => void;
}

type Props = OwnProps & RouteComponentProps;

const ScriptsTable: React.FC<Props> = ({
  paper,
  scripts,
  refreshScripts,
  isLoadingScripts
}) => {
  const classes = useStyles();

  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);

  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const getScriptTemplate = async (paperId: number) => {
    const data = await api.scriptTemplates.getScriptTemplate(paper.id);
    setScriptTemplate(data);
  };

  useEffect(() => {
    getScriptTemplate(paper.id);
    setIsLoadingScriptTemplate(false);
  }, []);

  const [searchText, setSearchText] = useState("");

  if (isLoadingScriptTemplate) {
    return <LoadingSpinner loadingMessage={`Loading script template...`} />;
  } else if (isLoadingScripts) {
    return <LoadingSpinner loadingMessage={`Loading scripts...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "Scripts (File name)",
      key: "scripts"
    },
    {
      name: "Student matriculation number",
      key: "students"
    },
    {
      name: "Script to student verification",
      key: "verified"
    },
    {
      name: "",
      key: ""
    }
  ];

  const filteredScripts = scripts.filter(script => {
    const { filename, student } = script;
    const studentName =
      student && student.user && student.user.name ? student.user.name : "";
    return (
      searchText === "" ||
      filename.includes(searchText) ||
      studentName.includes(searchText)
    );
  });

  return (
    <>
      <SearchBar
        value={""}
        placeholder="Search..."
        onChange={str => setSearchText(str)}
      />
      <UploadScriptsWrapper paperId={paper.id} refreshScripts={refreshScripts}>
        <Button variant="outlined" fullWidth>
          Upload
        </Button>
      </UploadScriptsWrapper>
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
                script={script}
                refreshScripts={refreshScripts}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default withRouter(ScriptsTable);
