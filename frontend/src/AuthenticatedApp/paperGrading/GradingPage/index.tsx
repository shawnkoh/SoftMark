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
import { GradingData, MarkerGradingData } from "backend/src/types/grading";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../api";
import BorderLinearProgress from "../../../components/BorderLinearProgress";
import LoadingSpinner from "../../../components/LoadingSpinner";
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
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const getGradingData = async () => {
      try {
        const response = await api.papers.getGradingData(paper.id);
        setGradingData(response.data);
      } catch (error) {
        toast.error(
          "An error occured while fetching the grading data. Please try refreshing the page"
        );
      }
      setLoading(false);
    };
    setLoading(true);
    getGradingData();
  }, [paper]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const {
    rootQuestionTemplates,
    totalQuestionCount,
    totalMarkCount,
    markers
  } = gradingData;

  const markerById = new Map<number, MarkerGradingData>();
  markers.forEach(marker => markerById.set(marker.id, marker));

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
      <Grid container spacing={2}>
        <Grid item className={classes.grow}>
          <Typography variant="h4">Marking</Typography>
        </Grid>
        <Grid item>
          <Typography variant="overline" className={classes.margin}>
            {`${rootQuestionTemplates.length}`} question(s) in total
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        alignItems="center"
        spacing={2}
        className={classes.margin}
      >
        <Grid item>
          <Typography variant="subtitle1">
            {`Total ${totalMarkCount}/${totalQuestionCount} (${(
              totalMarkCount / totalQuestionCount
            ).toLocaleString(undefined, {
              style: "percent"
            })})`}
          </Typography>
        </Grid>
        <Grid item className={classes.grow}>
          <BorderLinearProgress
            value={(totalMarkCount / totalQuestionCount) * 100}
            color="secondary"
            variant="determinate"
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
            {rootQuestionTemplates.map((rootQuestionTemplate, index) => {
              const mappedMarkers = rootQuestionTemplate.markers
                .filter(id => markerById.has(id))
                .map(id => markerById.get(id)!);
              return (
                <GradingTableRow
                  key={index}
                  questionTemplate={rootQuestionTemplate}
                  markers={mappedMarkers}
                />
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default GradingSubpage;
