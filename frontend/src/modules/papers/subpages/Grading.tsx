import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../api";
import { PaperData } from "backend/src/types/papers";
import { QuestionTemplateListData } from "backend/src/types/questionTemplates";
import { TableColumn } from "../../../components/tables/TableTypes";

import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Divider,
  Grid,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
  Paper
} from "@material-ui/core";
import SearchBar from "../../../components/fields/SearchBar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import GradingTableRow from "./GradingTableRow";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));
 
interface OwnProps {
  paper: PaperData;
}

type Props = OwnProps & RouteComponentProps;

const GradingSubpage: React.FC<Props> = ({ paper }) => {
  const classes = useStyles();

  const [questionTemplates, setQuestionTemplates] = useState<QuestionTemplateListData[]>([]);
  const [isLoadingQuestionTemplates, setIsLoadingQuestionTemplates] = useState(true);
  const [refreshQuestionTemplatesFlag, setRefreshQuestionTemplatesFlag] = useState(0);

  const getQuestionTemplates = () => {
    api.questionTemplates
      .getQuestionTemplates(paper.id)
      .then(resp => {
          console.log(resp);
          setQuestionTemplates(resp.data.questionTemplates);
      })
      .finally(() => setIsLoadingQuestionTemplates(false));
  };

  useEffect(getQuestionTemplates, [refreshQuestionTemplatesFlag]);

  if (isLoadingQuestionTemplates) {
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
    <Typography variant="h6">
        Marking
    </Typography>
     <Divider/>
      <Box justifyContent="center">
      <LinearProgress value={70} color="secondary" variant="determinate"/>      
      {`${questionTemplates.length}`} questions
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
            {questionTemplates.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No questions found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {questionTemplates.map((questionTemplate: QuestionTemplateListData, index) => {
             return (
                <GradingTableRow
                  key={questionTemplate.id}
                  questionTemplate={questionTemplate}
                />
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default withRouter(GradingSubpage);
