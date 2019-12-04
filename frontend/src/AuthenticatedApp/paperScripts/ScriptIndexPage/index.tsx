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
import DownloadIcon from "@material-ui/icons/CloudDownload";
import PublishIcon from "@material-ui/icons/Publish";
import { QuestionTemplateData } from "backend/src/types/questionTemplates";
import { ScriptListData } from "backend/src/types/scripts";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import api from "../../../api";
import RoundedButton from "../../../components/buttons/RoundedButton";
import SearchBar from "../../../components/fields/SearchBar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { TableColumn } from "../../../components/tables/TableTypes";
import usePaper from "../../../contexts/PaperContext";
import useScriptsAndStudents from "../../../contexts/ScriptsAndStudentsContext";
import useScriptTemplate from "../../../contexts/ScriptTemplateContext";
import PublishScriptsModal from "./PublishScriptsModal";
import ScriptsTableRow from "./ScriptsTableRow";
import useStyles from "./styles";

const ASC = "asc";
const DESC = "desc";
const ID = "id";
const MATRIC = "matric";
const SCRIPT = "script";
const SCORE = "score";

const getTableComparator = (order: string, orderBy: string) => {
  return (a: ScriptListData, b: ScriptListData) => {
    let res = 0;

    if (orderBy === ID) {
      res = a.id - b.id;
    } else if (orderBy === SCRIPT) {
      const filenameA = a.filename.toLowerCase();
      const filenameB = b.filename.toLowerCase();
      res = filenameA.localeCompare(filenameB);
    } else if (orderBy === MATRIC) {
      const matriculationNumberA = (a.matriculationNumber || "").toLowerCase();
      const matriculationNumberB = (b.matriculationNumber || "").toLowerCase();
      res = matriculationNumberA.localeCompare(matriculationNumberB);
    } else if (orderBy === SCORE) {
      res = a.totalScore - b.totalScore;
    }
    if (order === ASC) {
      res *= -1;
    }
    return res;
  };
};

const columns: TableColumn[] = [
  { name: "ID", key: ID, isSortable: true },
  {
    name: "Filename",
    key: SCRIPT,
    isSortable: true
  },
  {
    name: "Matriculation Number",
    key: MATRIC,
    isSortable: true
  },
  {
    name: "Name / Email",
    key: "name"
  },
  {
    name: "Total Score",
    key: SCORE,
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

const ScriptIndex: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const paper = usePaper();
  const {
    isLoadingScriptTemplate,
    scriptTemplate,
    refreshScriptTemplate
  } = useScriptTemplate();
  const { isLoadingScripts, scripts, refreshScripts } = useScriptsAndStudents();
  const isLoading = isLoadingScriptTemplate || isLoadingScripts;

  const [order, setOrder] = React.useState(DESC);
  const [orderBy, setOrderBy] = React.useState(ID);
  const [searchText, setSearchText] = useState("");
  const [sortedScripts, setSortedScripts] = useState<ScriptListData[]>(
    scripts.sort(getTableComparator(order, orderBy))
  );
  const [questionTemplates, setQuestionTemplates] = useState<
    QuestionTemplateData[]
  >([]);

  useEffect(() => {
    // TODO: Make refresh script template faster
    // refreshScriptTemplate();
    refreshScripts();
    getQuestionTemplates();
  }, []);

  useEffect(() => {
    setSortedScripts(scripts.sort(getTableComparator(order, orderBy)));
  }, [scripts]);

  const getQuestionTemplates = async () => {
    const allocationsResponse = await api.allocations.getSelfAllocations(
      paper.id
    );
    const allocations = allocationsResponse.data.allocations;
    const questionTemplateIds = allocations.map(
      allocation => allocation.questionTemplateId
    );
    if (scriptTemplate) {
      const questionTemplates = questionTemplateIds
        .map(id =>
          scriptTemplate.questionTemplates.find(
            questionTemplate => id === questionTemplate.id
          )
        )
        .filter(questionTemplate => !!questionTemplate);
      setQuestionTemplates(questionTemplates as QuestionTemplateData[]);
    }
  };

  const sortBy = (newOrderBy: string) => {
    let newOrder = order;
    if (newOrderBy === orderBy) {
      newOrder = order === ASC ? DESC : ASC;
    } else {
      newOrder = DESC;
    }
    setOrder(newOrder);
    setOrderBy(newOrderBy);
    setSortedScripts(scripts.sort(getTableComparator(newOrder, newOrderBy)));
  };

  const filteredScripts = sortedScripts.filter(script => {
    const { filename, matriculationNumber, studentName, studentEmail } = script;
    const lowerCaseSearchText = searchText.toLowerCase();
    return (
      searchText === "" ||
      filename.toLowerCase().includes(lowerCaseSearchText) ||
      (matriculationNumber &&
        matriculationNumber.toLowerCase().includes(lowerCaseSearchText)) ||
      (studentName &&
        studentName.toLowerCase().includes(lowerCaseSearchText)) ||
      (studentEmail && studentEmail.toLowerCase().includes(lowerCaseSearchText))
    );
  });

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2}>
        <Grid item className={classes.grow}>
          <Typography variant="h4">Scripts</Typography>
        </Grid>
        <Grid item>
          <Typography variant="overline" className={classes.marginTop}>
            {scripts.length} script(s) in total
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={1}
        className={clsx(classes.marginTop, classes.margin)}
      >
        <Grid item className={classes.grow}>
          <SearchBar
            value={""}
            placeholder="Search by matric number, name or email"
            onChange={str => setSearchText(str)}
          />
        </Grid>
        <Grid item>
          <PublishScriptsModal
            scripts={scripts}
            render={toggleModal => (
              <RoundedButton
                variant="contained"
                color="primary"
                onClick={toggleModal}
                startIcon={<PublishIcon />}
                disabled={!!paper.publishedDate}
              >
                Publish
              </RoundedButton>
            )}
          />
        </Grid>
        <Grid item>
          <RoundedButton
            variant="contained"
            color="primary"
            onClick={() => history.push(`/papers/${paper.id}/save_scripts`)}
            startIcon={<DownloadIcon />}
          >
            Download all scripts
          </RoundedButton>
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
            {isLoading && <LoadingSpinner />}
            {!isLoading && filteredScripts.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No scripts found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              filteredScripts.map((script: ScriptListData, index) => {
                return (
                  <ScriptsTableRow
                    key={script.id}
                    script={script}
                    questionTemplates={questionTemplates}
                  />
                );
              })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ScriptIndex;
