import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../api";
import { PaperData } from "backend/src/types/papers";
import { PaperUserListData } from "../../types/paperUsers";
import { QuestionTemplateListData } from "backend/src/types/questionTemplates";
import { TableColumn } from "../../components/tables/TableTypes";

import { makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Paper
} from "@material-ui/core";
import LoadingSpinner from "../../components/LoadingSpinner";
import MarkersTableRow from "./components/MarkersTableRow";

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

const QuestionAllocationPage: React.FC<Props> = ({ paper }) => {
  const classes = useStyles();

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
    // api.questionTemplates
    //   .getQuestionTemplates(paper.id)
    //   .then(resp => {
    //     console.log(resp);
    //     setQuestionTemplates(resp.data.questionTemplates);
    //   })
    //   .finally(() => setIsLoadingQuestionTemplates(false));
  };
  useEffect(getQuestionTemplates, [refreshQuestionTemplatesFlag]);

  const [markers, setMarkers] = useState<PaperUserListData[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(true);
  const [refreshMarkersFlag, setRefreshMarkersFlag] = useState(0);
  const getMarkers = () => {
    /*api.questionTemplates
      .getQuestionTemplates(paper.id)
      .then(resp => {
        console.log(resp);
        setQuestionTemplates(resp.data.questionTemplates);
      })
      .finally(() => setIsLoadingQuestionTemplates(false));*/
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
      name: "Role",
      key: "role"
    },
    {
      name: "Account status",
      key: "accountStatus"
    },
    {
      name: "",
      key: ""
    }
  ];

  return (
    <>
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
                  index={index + 1}
                  marker={marker}
                  refreshMarkers={refreshMarkers}
                />
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default withRouter(QuestionAllocationPage);
