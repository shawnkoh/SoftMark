import {
  Box,
  Container,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from "@material-ui/core";
import {
  QuestionTemplateGradingListData,
  QuestionTemplateRootData
} from "backend/src/types/questionTemplates";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { UserListData } from "backend/src/types/users";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import BorderLinearProgress from "../../../components/BorderLinearProgress";
import { TableColumn } from "../../../components/tables/TableTypes";
import usePaper from "../../../contexts/PaperContext";
import GradingTableRow from "./GradingTableRow";
import useStyles from "./styles";

const GradingSubpage: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();

  /** Script template hooks start */
  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);
  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const getScriptTemplate = async () => {
    const scriptTemplate = await api.scriptTemplates.getScriptTemplate(
      paper.id
    );
    setScriptTemplate(scriptTemplate);
    setIsLoadingScriptTemplate(false);
    return scriptTemplate;
  };

  useEffect(() => {
    getScriptTemplate();
  }, []);

  // getRootQuestionTemplates states
  const [
    questionTemplateGradingListData,
    setQuestionTemplateGradingListData
  ] = useState<QuestionTemplateGradingListData>({
    rootQuestionTemplates: [],
    markers: [],
    totalQuestionCount: 0,
    totalMarkCount: 0
  });

  const getRootQuestionTemplates = () => {
    if (scriptTemplate) {
      api.scriptTemplates
        .getRootQuestionTemplates(scriptTemplate.id)
        .then(res => setQuestionTemplateGradingListData(res.data));
    }
  };
  useEffect(getRootQuestionTemplates, [scriptTemplate]);
  /** root question template hooks end */

  if (isLoadingScriptTemplate) {
    return <LoadingSpinner loadingMessage={`Loading script template...`} />;
  } else if (!scriptTemplate) {
    return <div>Please upload a script template first</div>;
  }

  const {
    rootQuestionTemplates = [],
    totalQuestionCount,
    totalMarkCount,
    markers
  } = questionTemplateGradingListData;

  const userMap = new Map<number, UserListData>();
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    userMap.set(marker.id, marker);
  }

  const columns: TableColumn[] = [
    {
      name: "Question",
      key: ""
    },
    {
      name: "Marks",
      key: "marks"
    },
    {
      name: "Marker",
      key: "marker"
    },
    {
      name: "Progress",
      key: "progress"
    },
    {
      name: "",
      key: ""
    }
  ];

  return (
    <Container maxWidth={false} className={classes.container}>
      <Typography variant="h4">Marking</Typography>
      <Box justifyContent="center" className={classes.margin}>
        <Typography variant="subtitle2" className={classes.margin}>
          {`${rootQuestionTemplates.length}`} question(s) in total
        </Typography>
        <BorderLinearProgress
          value={totalMarkCount / totalQuestionCount}
          color="secondary"
          variant="determinate"
          className={classes.margin}
        />
      </Box>
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
            {rootQuestionTemplates.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No questions found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {rootQuestionTemplates.map(
              (rootQuestionTemplate: QuestionTemplateRootData, index) => {
                const modifiedTemplate: any = rootQuestionTemplate;
                modifiedTemplate.markers = rootQuestionTemplate.markers
                  .map(markerId => userMap.get(markerId))
                  .filter(marker => marker);
                return (
                  <GradingTableRow
                    key={rootQuestionTemplate.id}
                    questionTemplate={rootQuestionTemplate}
                  />
                );
              }
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default GradingSubpage;
