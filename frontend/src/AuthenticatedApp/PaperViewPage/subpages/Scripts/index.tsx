import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ScriptListData } from "backend/src/types/scripts";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { TableColumn } from "../../../../components/tables/TableTypes";
import usePaper from "../../../../contexts/PaperContext";
import ScriptsTableRow from "./ScriptsTableRow";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

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

  const [searchText, setSearchText] = useState("");

  const ASC = "asc";
  const DESC = "desc";
  const [order, setOrder] = React.useState(DESC);
  const [orderBy, setOrderBy] = React.useState("script");
  const flag = order + orderBy;

  const tableComparator = (a: ScriptListData, b: ScriptListData) => {
    let res = 0;
    const studentA = a.student;
    const studentB = b.student;

    if (orderBy === "script") {
      const filenameA = a.filename.toLowerCase();
      const filenameB = b.filename.toLowerCase();
      res = filenameA.localeCompare(filenameB);
    } else if (orderBy === "matric") {
      const matriculationNumberA = (studentA && studentA.matriculationNumber
        ? studentA.matriculationNumber
        : ""
      ).toLowerCase();
      const matriculationNumberB = (studentB && studentB.matriculationNumber
        ? studentB.matriculationNumber
        : ""
      ).toLowerCase();
      res = matriculationNumberA.localeCompare(matriculationNumberB);
    } else if (orderBy === "score") {
      res = a.awardedMarks - b.awardedMarks;
    }
    if (order === DESC) {
      res *= -1;
    }
    return res;
  };

  const sortTable = () => {
    setScripts(scripts.sort(tableComparator));
  };

  const sortBy = (str: string) => {
    if (str === orderBy) {
      setOrder(order === ASC ? DESC : ASC);
    } else {
      setOrder(DESC);
    }
    setOrderBy(str);
  }; 

  useEffect(() => {
    setTimeout(sortTable, 1000)
  }, [flag]);

  if (isLoadingScripts) {
    return <LoadingSpinner loadingMessage={`Loading scripts...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "Script (File name)",
      key: "script",
      isSortable: true
    },
    {
      name: "Student matriculation number",
      key: "matric",
      isSortable: true
    },
    {
      name: "Name / Email",
      key: "name"
    },
    {
      name: "Score",
      key: "score",
      isSortable: true
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
    <>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={1}
      >
        <Grid item>
          <SearchBar
            value={""}
            placeholder="Search..."
            onChange={str => setSearchText(str)}
          />
        </Grid>
        <Grid item>Total scripts: {scripts.length}</Grid>
      </Grid>
      <Paper className={classes.tableWrapper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>
                  {column.isSortable ? (
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={order === ASC ? ASC : DESC}
                      onClick={() => {
                        sortBy(column.key);
                      }}
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
    </>
  );
};

export default ScriptsSubpage;
