import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import api from "../../../../api";
import { PaperData } from "backend/src/types/papers";
import { PaperUserListData } from "../../../../types/paperUsers";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import { TableColumn } from "../../../../components/tables/TableTypes";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Tooltip,
  Paper
} from "@material-ui/core";
import Cancel from "@material-ui/icons/Cancel";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/loading/LoadingSpinner";
import UploadNominalRollWrapper from "../../../../components/uploadWrappers/UploadNominalRollWrapper";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

interface OwnProps {
  paper: PaperData;
  students: PaperUserListData[];
  isLoadingStudents: boolean;
  refreshScripts: () => void;
  refreshStudents: () => void;
}

type Props = OwnProps & RouteComponentProps;

const StudentsTable: React.FC<Props> = ({
  paper,
  students,
  refreshScripts,
  isLoadingScripts
}) => {
  const classes = useStyles();

  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);

  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  useEffect(() => {
    api.scriptTemplates
      .getScriptTemplate(paper.id)
      .then(resp => {
        setScriptTemplate(resp.data.scriptTemplate);
      })
      .finally(() => setIsLoadingScriptTemplate(false));
  }, []);

  const [searchText, setSearchText] = useState("");

  if (isLoadingScriptTemplate) {
    return <LoadingSpinner loadingMessage={`Loading script template...`} />;
  } else if (isLoadingScripts) {
    return <LoadingSpinner loadingMessage={`Loading scripts...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "Student matriculation number",
      key: "matric"
    },
    {
      name: "Name",
      key: "name"
    },
    {
      name: "Email",
      key: "email"
    },
    {
      name: "",
      key: ""
    }
  ];

  console.log(students);

  const filteredStudents = students.filter(student => {
    const { user, matriculationNumber } = student;
    const matricNo = matriculationNumber || "";
    const studentName = user.name;
    return (
      searchText === "" ||
      matricNo.includes(searchText) ||
      studentName.includes(searchText)
    );
  });

  return (
    <>
      <SearchBar
        value={""}
        placeholder="Search..."
        onChange={str => setSearchText(str)}
      />
      <UploadNominalRollWrapper
        paperId={paper.id}
        refreshScripts={refreshScripts}
      >
        <Button variant="outlined" fullWidth>
          Upload
        </Button>
      </UploadNominalRollWrapper>
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
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No students found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {filteredStudents.map((student: PaperUserListData) => {
              const { matriculationNumber, user } = student;
              const { name, email } = user;
              return (
                <TableRow>
                  <TableCell>
                    {matriculationNumber ? matriculationNumber : ""}
                  </TableCell>
                  <TableCell>{name ? name : "-"}</TableCell>
                  <TableCell>{email}</TableCell>
                  <TableCell>
                    <Tooltip title={"Edit student"}>
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      onClick={() => {
                        //api.paperUsers.discardPaperUser()
                      }}
                    >
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default withRouter(StudentsTable);
