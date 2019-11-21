import {
  Box,
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
import {
  GradingData,
  QuestionTemplateGradingRootData
} from "backend/src/types/grading";
import { UserListData } from "backend/src/types/users";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import BorderLinearProgress from "../../../components/BorderLinearProgress";
import { TableColumn } from "../../../components/tables/TableTypes";
import usePaper from "../../../contexts/PaperContext";
import GradingTableRow from "./GradingTableRow";
import useStyles from "./styles";

const GradingSubpage: React.FC = () => {
  const classes = useStyles();
  const paper = usePaper();

  const [gradingData, setGradingData] = useState<GradingData>({
    rootQuestionTemplates: [],
    markers: [],
    totalQuestionCount: 0,
    totalMarkCount: 0
  });

  useEffect(() => {
    api.papers
      .getGradingData(paper.id)
      .then(res => setGradingData(res.data))
      // TODO: Handle this better
      .catch(error => toast.error("Failed to get GradingData"));
  }, [paper]);
  /** root question template hooks end */

  const {
    rootQuestionTemplates = [],
    totalQuestionCount,
    totalMarkCount,
    markers
  } = gradingData;

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
      <Typography variant="subtitle2" className={classes.margin}>
        {`${rootQuestionTemplates.length}`} question(s) in total
      </Typography>
      <Box display="flex" alignItems="center" className={classes.margin}>
        <Typography variant="subtitle1" className={classes.marginRight}>
          {(totalMarkCount / totalQuestionCount).toLocaleString(undefined, {
            style: "percent"
          })}
        </Typography>
        <BorderLinearProgress
          value={totalMarkCount / totalQuestionCount}
          color="secondary"
          variant="determinate"
          className={classes.grow}
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
              (
                rootQuestionTemplate: QuestionTemplateGradingRootData,
                index
              ) => {
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
