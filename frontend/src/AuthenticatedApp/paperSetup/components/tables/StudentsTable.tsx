import {
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
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import ThemedButton from "../../../../components/buttons/ThemedButton";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { TableColumn } from "../../../../components/tables/TableTypes";
import UploadNominalRollWrapper from "../../../../components/uploadWrappers/UploadNominalRollWrapper";
import usePaper from "../../../../contexts/PaperContext";
import { PaperUserListData } from "../../../../types/paperUsers";
import AddStudentModal from "../modals/AddStudentModal";
import DeleteAllStudentsModal from "../modals/DeleteAllStudentsModal";
import StudentsTableRow from "./StudentsTableRow";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto"
  },
  margin: {
    marginBottom: theme.spacing(1)
  }
}));

const StudentsTable: React.FC = () => {
  const paper = usePaper();
  const classes = useStyles();

  const [students, setStudents] = useState<PaperUserListData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [refreshStudentsFlag, setRefreshStudentsFlag] = useState(0);

  const getStudents = () => {
    api.paperUsers
      .getStudents(paper.id)
      .then(resp => {
        setStudents(resp.data.paperUsers);
      })
      .finally(() => setIsLoadingStudents(false));
  };

  useEffect(getStudents, [refreshStudentsFlag]);

  const refreshStudents = () => {
    setTimeout(() => {
      setRefreshStudentsFlag(refreshStudentsFlag + 1);
    }, 2500);
  };
  const callbackStudents = () => {
    setTimeout(() => {
      getStudents();
    }, 2000);
  };

  const [searchText, setSearchText] = useState("");

  if (isLoadingStudents) {
    return <LoadingSpinner loadingMessage={`Loading students...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "Student matriculation number",
      key: "matric"
    },
    {
      name: "Pages",
      key: "pages"
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

  const filteredStudents = students.filter(student => {
    const { user, matriculationNumber } = student;
    const matricNo = matriculationNumber || "";
    const studentName = user.name || "";
    const email = user.email || "";
    const lowerCaseSearchText = searchText.toLowerCase();
    return (
      searchText === "" ||
      matricNo.toLowerCase().includes(lowerCaseSearchText) ||
      studentName.toLowerCase().includes(lowerCaseSearchText) ||
      email.toLowerCase().includes(lowerCaseSearchText)
    );
  });

  return (
    <>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={1}
        className={classes.margin}
      >
        <Grid item>
          <SearchBar
            value={""}
            placeholder="Search..."
            onChange={str => setSearchText(str)}
          />
        </Grid>
        <Grid item>
          <UploadNominalRollWrapper
            paperId={paper.id}
            refreshStudents={getStudents}
          >
            <ThemedButton label="Upload" filled />
          </UploadNominalRollWrapper>
        </Grid>
        <Grid item>
          <DeleteAllStudentsModal
            students={students}
            refreshStudents={callbackStudents}
          />
        </Grid>
        <Grid item>
          <AddStudentModal paperId={paper.id} refreshStudents={getStudents} />
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">
            Total students: {students.length}
          </Typography>
        </Grid>
      </Grid>
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
              return (
                <StudentsTableRow
                  key={student.id}
                  student={student}
                  refreshStudents={refreshStudents}
                />
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default StudentsTable;
