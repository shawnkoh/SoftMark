import {
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from "@material-ui/core";
import PublishIcon from "@material-ui/icons/Publish";
import { ScriptListData } from "backend/src/types/scripts";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import RoundedButton from "../../../components/buttons/RoundedButton";
import SearchBar from "../../../components/fields/SearchBar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { TableColumn } from "../../../components/tables/TableTypes";
import usePaper from "../../../contexts/PaperContext";
import PublishScriptsModal from "./PublishScriptsModal";
import ScriptsTableRow from "./ScriptsTableRow";
import useStyles from "./styles";

const ScriptsSubpage: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();

  const ASC = "asc";
  const DESC = "desc";
  const [order, setOrder] = React.useState(DESC);
  const [orderBy, setOrderBy] = React.useState("script");
  const resetOrder = () => {
    setOrder(ASC);
    setOrderBy("script");
  };

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

  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  const getScripts = () => {
    setIsLoadingScripts(true);
    api.scripts
      .getScripts(paper.id)
      .then(resp => {
        resetOrder();
        setScripts(resp.data.scripts);
      })
      .finally(() => setIsLoadingScripts(false));
  };

  useEffect(getScripts, []);

  const [searchText, setSearchText] = useState("");

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
    if (!isLoadingScripts) {
      setTimeout(sortTable, 1000);
    }
  }, [order, orderBy]);

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
      name: "Published",
      key: "published"
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
      <Typography variant="subtitle2" className={classes.marginTop}>
        {scripts.length} scripts in total
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
          <PublishScriptsModal
            refreshScripts={getScripts}
            render={toggleModal => (
              <RoundedButton
                variant="contained"
                color="primary"
                onClick={toggleModal}
                startIcon={<PublishIcon />}
              >
                Publish
              </RoundedButton>
            )}
          />
        </Grid>
      </Grid>
      <Paper className={clsx(classes.margin, classes.tableWrapper)}>
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
    </Container>
  );
};

export default ScriptsSubpage;
