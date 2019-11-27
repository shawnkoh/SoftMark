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
import { ScriptListData } from "backend/src/types/scripts";
import clsx from "clsx";
import useScriptsAndStudents from "contexts/ScriptsAndStudentsContext";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import api from "../../../api";
import RoundedButton from "../../../components/buttons/RoundedButton";
import SearchBar from "../../../components/fields/SearchBar";
import { TableColumn } from "../../../components/tables/TableTypes";
import usePaper from "../../../contexts/PaperContext";
import PublishScriptsModal from "./PublishScriptsModal";
import ScriptsTableRow from "./ScriptsTableRow";
import useStyles from "./styles";
import { QuestionTemplate } from "./types";

const ASC = "asc";
const DESC = "desc";
const MATRIC = "matric";
const SCRIPT = "script";
const SCORE = "score";

const ScriptsSubpage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const paper = usePaper();
  const scriptsAndStudents = useScriptsAndStudents();

  const [scripts, setScripts] = useState<ScriptListData[]>(
    scriptsAndStudents.scripts
  );

  const [questionTemplates, setQuestionTemplates] = useState<
    QuestionTemplate[]
  >([]);

  const mapQuestionTemplateIds = async (questionTemplateIds: number[]) => {
    return Promise.all(
      questionTemplateIds.map(async questionTemplateId => {
        const response = await api.questionTemplates.getQuestionTemplate(
          questionTemplateId
        );
        const questionTemplate = response.data.questionTemplate;
        return { id: questionTemplateId, name: questionTemplate.name };
      })
    );
  };

  const getQuestionTemplates = async () => {
    const allocationsResponse = await api.allocations.getSelfAllocations(
      paper.id
    );
    const allocations = allocationsResponse.data.allocations;
    const questionTemplateIds = allocations.map(
      allocation => allocation.questionTemplateId
    );
    const questionTemplates = await mapQuestionTemplateIds(questionTemplateIds);
    setQuestionTemplates(questionTemplates);
  };

  useEffect(() => {
    getQuestionTemplates();
  }, []);

  const [searchText, setSearchText] = useState("");

  const [order, setOrder] = React.useState(DESC);
  const [orderBy, setOrderBy] = React.useState(SCRIPT);

  const getTableComparator = (order: string, orderBy: string) => {
    return (a: ScriptListData, b: ScriptListData) => {
      let res = 0;
      const studentA = a.student;
      const studentB = b.student;

      if (orderBy === SCRIPT) {
        const filenameA = a.filename.toLowerCase();
        const filenameB = b.filename.toLowerCase();
        res = filenameA.localeCompare(filenameB);
      } else if (orderBy === MATRIC) {
        const matriculationNumberA = (studentA && studentA.matriculationNumber
          ? studentA.matriculationNumber
          : ""
        ).toLowerCase();
        const matriculationNumberB = (studentB && studentB.matriculationNumber
          ? studentB.matriculationNumber
          : ""
        ).toLowerCase();
        res = matriculationNumberA.localeCompare(matriculationNumberB);
      } else if (orderBy === SCORE) {
        res = a.awardedMarks - b.awardedMarks;
      }
      if (order === ASC) {
        res *= -1;
      }
      return res;
    };
  };

  const sortBy = (newOrderBy: string) => {
    setScripts([]);
    let newOrder = order;
    if (newOrderBy === orderBy) {
      newOrder = order === ASC ? DESC : ASC;
    } else {
      newOrder = DESC;
    }
    setOrder(newOrder);
    setOrderBy(newOrderBy);
    setScripts(scripts.sort(getTableComparator(newOrder, newOrderBy)));
  };

  const columns: TableColumn[] = [
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
            placeholder="Search..."
            onChange={str => setSearchText(str)}
          />
        </Grid>
        <Grid item>
          <PublishScriptsModal
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
            {filteredScripts.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No scripts found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {filteredScripts.map((script: ScriptListData, index) => {
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

export default ScriptsSubpage;
