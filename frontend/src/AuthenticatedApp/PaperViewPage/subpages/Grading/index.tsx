import {
  Box,
  Divider,
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
import { QuestionTemplateRootData } from "backend/src/types/questionTemplates";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { UserListData } from "backend/src/types/users";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../../api";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { TableColumn } from "../../../../components/tables/TableTypes";
import usePaper from "../../../../contexts/PaperContext";
import GradingTableRow from "./GradingTableRow";
import useStyles from "./styles";

const GradingSubpage: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();
  const [isLoading, setIsLoading] = useState(true);

  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  // getRootQuestionTemplates states
  const [rootQuestionTemplates, setRootQuestionTemplates] = useState<
    QuestionTemplateRootData[]
  >([]);
  const [markers, setMarkers] = useState<UserListData[]>([]);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [totalMarkCount, setTotalMarkCount] = useState(0);

  const resetState = () => {
    setRootQuestionTemplates([]);
    setMarkers([]);
    setTotalQuestionCount(0);
    setTotalMarkCount(0);
  };

  const getScriptTemplate = async () => {
    const scriptTemplate = await api.scriptTemplates.getScriptTemplate(
      paper.id
    );
    setScriptTemplate(scriptTemplate);
    return scriptTemplate;
  };

  useEffect(() => {
    getScriptTemplate();
  }, []);

  const getRootQuestionTemplates = async () => {
    if (!scriptTemplate) {
      resetState();
      return;
    }

    try {
      const { data } = await api.scriptTemplates.getRootQuestionTemplates(
        scriptTemplate.id
      );
      const {
        rootQuestionTemplates,
        markers,
        totalQuestionCount,
        totalMarkCount
      } = data;
      setRootQuestionTemplates(rootQuestionTemplates);
      setMarkers(markers);
      setTotalQuestionCount(totalQuestionCount);
      setTotalMarkCount(totalMarkCount);
      setIsLoading(false);
    } catch (error) {
      toast.error("An error occured while loading the rootQuestionTemplates");
      resetState();
    }
  };

  useEffect(() => {
    getRootQuestionTemplates();
  }, [scriptTemplate]);

  useEffect(() => {}, [scriptTemplate]);

  if (isLoading) {
    return <LoadingSpinner loadingMessage={`Loading scripts...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "",
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
    <>
      <Typography variant="h6">Marking</Typography>
      <Divider />
      <Box justifyContent="center">
        <LinearProgress value={70} color="secondary" variant="determinate" />
        {`${rootQuestionTemplates.length}`} questions
      </Box>
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
    </>
  );
};

export default GradingSubpage;
