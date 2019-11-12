import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../api";
import { PaperData } from "backend/src/types/papers";
import { PaperUserListData } from "../../types/paperUsers";
import { QuestionTemplateListData } from "backend/src/types/questionTemplates";
import { TableColumn } from "../../components/tables/TableTypes";
import usePaper from "../../contexts/PaperContext";

import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Paper
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import LoadingSpinner from "../../components/LoadingSpinner";
import MarkersTableRow from "./components/MarkersTableRow";
import AddMarkerModal from "./components/AddMarkerModal";
import Header from "../paperSetup/components/PaperSetupHeader";

const useStyles = makeStyles(theme => ({
  margin: {
    marginTop: theme.spacing(4)
  },
  tableWrapper: {
    overflowX: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

type Props = RouteComponentProps;

const QuestionAllocationPage: React.FC<Props> = () => {
  const classes = useStyles();
  const paper = usePaper();

  const [questionTemplates, setQuestionTemplates] = useState<
    QuestionTemplateListData[]
  >([]);
  const [isLoadingQuestionTemplates, setIsLoadingQuestionTemplates] = useState(
    true
  );
  const [
    refreshQuestionTemplatesFlag,
    setRefreshQuestionTemplatesFlag
  ] = useState(0);
  const getQuestionTemplates = () => {
    api.questionTemplates
      .getQuestionTemplates(paper.id)
      .then(resp => setQuestionTemplates(resp.data.questionTemplates))
      .finally(() => setIsLoadingQuestionTemplates(false));
  };
  useEffect(getQuestionTemplates, [refreshQuestionTemplatesFlag]);

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
            {markers.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No students found.</div>
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
        <AddMarkerModal
          paperId={paper.id}
          refreshMarkers={refreshMarkers}
          render={toggleModal => (
            <Box display="flex" alignItems="center" className={classes.margin}>
              <Button
                onClick={toggleModal}
                color="primary"
                size="large"
                fullWidth
                startIcon={<AddIcon />}
              >
                Add Marker
              </Button>
            </Box>
          )}
        />
      </Paper>
    </>
  );
};

export default withRouter(QuestionAllocationPage);
