import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { ScriptListData } from "backend/src/types/scripts";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { TableColumn } from "../../../../components/tables/TableTypes";
import usePaper from "../../../../contexts/PaperContext";
import ScriptsTableRow from "./ScriptsTableRow";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4)
    },
    margin: {
      marginTop: theme.spacing(2)
    },
    tableWrapper: {
      overflowX: "auto"
    }
  })
);

const ScriptsSubpage: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();

  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);
  const [refreshScriptsFlag, setRefreshScriptsFlag] = useState(0);

  const getScripts = () => {
    api.scripts
      .getScripts(paper.id)
      .then(resp => {
        if (resp !== null) {
          setScripts(resp);
        }
      })
      .finally(() => setIsLoadingScripts(false));
  };

  useEffect(getScripts, [refreshScriptsFlag]);

  const refreshScripts = () => {
    setTimeout(() => {
      setRefreshScriptsFlag(refreshScriptsFlag + 1);
    }, 2500);
  };
  const callbackScripts = () => {
    setTimeout(() => {
      getScripts();
    }, 2000);
  };

  const [searchText, setSearchText] = useState("");

  if (isLoadingScripts) {
    return <LoadingSpinner loadingMessage={`Loading scripts...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "Script (File name)",
      key: "script"
    },
    {
      name: "Student matriculation number",
      key: "matric"
    },
    {
      name: "Name / Email",
      key: "name"
    },
    {
      name: "Score",
      key: "score"
    },
    {
      name: "",
      key: ""
    }
  ];

  const filteredScripts = scripts.filter(script => {
    const { filename, student } = script;
    const matricNo =
      student && student.matriculationNumber ? student.matriculationNumber : "";
    const studentName =
      student && student.user && student.user.name ? student.user.name : "";
    const email = student && student.user ? student.user.email : "";
    const lowerCaseSearchText = searchText.toLowerCase();
    return (
      searchText === "" ||
      filename.toLowerCase().includes(lowerCaseSearchText) ||
      matricNo.toLowerCase().includes(lowerCaseSearchText) ||
      studentName.toLowerCase().includes(lowerCaseSearchText) ||
      email.toLowerCase().includes(lowerCaseSearchText)
    );
  });

  return (
    <Container maxWidth={false} className={classes.container}>
      <Typography variant="h4">Scripts</Typography>
      <Typography variant="subtitle2" className={classes.margin}>
        {scripts.length} scripts in total
      </Typography>
      <SearchBar
        value={""}
        placeholder="Search..."
        onChange={str => setSearchText(str)}
        className={classes.margin}
      />
      <Paper className={clsx(classes.margin, classes.tableWrapper)}>
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
                  <div style={{ textAlign: "center" }}>No students found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {filteredScripts.map((script: ScriptListData, index) => {
              return <ScriptsTableRow key={script.id} script={script} />;
            })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ScriptsSubpage;
