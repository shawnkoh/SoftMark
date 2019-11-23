import {
  Box,
  Button,
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
import AddIcon from "@material-ui/icons/Add";
import { QuestionTemplateData } from "backend/src/types/questionTemplates";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { TableColumn } from "../../../components/tables/TableTypes";
import usePaper from "../../../contexts/PaperContext";
import { PaperUserListData } from "../../../types/paperUsers";
import Header from "../components/PaperSetupHeader";
import AddMarkerModal from "./components/AddMarkerModal";
import MarkersTableRow from "./components/MarkersTableRow";

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
    },
    button: {
      borderRadius: 48
    }
  })
);

const QuestionAllocationPage: React.FC = props => {
  const classes = useStyles();
  const paper = usePaper();

  /** Question template hooks start */
  const [questionTemplates, setQuestionTemplates] = useState<
    QuestionTemplateData[]
  >([]);
  const [isLoadingQuestionTemplates, setIsLoadingQuestionTemplates] = useState(
    true
  );

  const getQuestionTemplates = () => {
    api.questionTemplates
      .getRootQuestionTemplates(paper.id)
      .then(resp => setQuestionTemplates(resp.data.rootQuestionTemplates))
      .finally(() => setIsLoadingQuestionTemplates(false));
  };
  useEffect(getQuestionTemplates, []);
  /** Question template hooks end */

  /** Markers hooks start */
  const [markers, setMarkers] = useState<PaperUserListData[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(true);
  const [refreshMarkersFlag, setRefreshMarkersFlag] = useState(0);
  const getMarkers = () => {
    api.paperUsers
      .getMarkers(paper.id)
      .then(resp => setMarkers(resp.data.paperUsers))
      .finally(() => setIsLoadingMarkers(false));
  };
  useEffect(getMarkers, [refreshMarkersFlag]);
  const refreshMarkers = () => setRefreshMarkersFlag(refreshMarkersFlag + 1);
  /** Markers hooks end */

  if (isLoadingQuestionTemplates) {
    return <LoadingSpinner loadingMessage={`Loading scripts...`} />;
  } else if (isLoadingMarkers) {
    return <LoadingSpinner loadingMessage={`Loading markers...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "",
      key: "index"
    },
    {
      name: "Name",
      key: "name"
    },
    {
      name: "E-mail",
      key: "email"
    },
    {
      name: "",
      key: ""
    },
    {
      name: "",
      key: ""
    }
  ];

  return (
    <>
      <Header title="Question allocation" />
      <Container maxWidth={false} className={classes.container}>
        <AddMarkerModal
          refreshMarkers={refreshMarkers}
          render={toggleModal => (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="overline">
                {markers.length} marker(s) in total
              </Typography>
              <Typography variant="overline">
                {`Click on chips to allocate questions to markers.`}
              </Typography>
              <Button
                onClick={toggleModal}
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                className={classes.button}
              >
                Add Marker
              </Button>
            </Box>
          )}
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
              {markers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <br />
                    <div style={{ textAlign: "center" }}>
                      No students found.
                    </div>
                    <br />
                  </TableCell>
                </TableRow>
              )}
              {markers.map((marker: PaperUserListData, index: number) => {
                return (
                  <MarkersTableRow
                    key={marker.id}
                    columns={columns.length}
                    questionTemplates={questionTemplates}
                    index={index + 1}
                    marker={marker}
                    refreshMarkers={refreshMarkers}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </>
  );
};

export default QuestionAllocationPage;
