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
import DeleteAllIcon from "@material-ui/icons/DeleteForever";
import UploadIcon from "@material-ui/icons/Publish";
import AddIcon from "@material-ui/icons/PersonAdd";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import RoundedButton from "../../../../components/buttons/RoundedButton";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { TableColumn } from "../../../../components/tables/TableTypes";
import UploadNominalRollWrapper from "../../../../components/uploadWrappers/UploadNominalRollWrapper";
import usePaper from "../../../../contexts/PaperContext";
import { PaperUserListData } from "../../../../types/paperUsers";
import AddStudentModal from "../modals/AddStudentModal";
import DeleteAllStudentsModal from "../modals/DeleteAllStudentsModal";
import StudentsTableRow from "./StudentsTableRow";
import useStyles from "./styles";

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
      name: "Matriculation number",
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
      key: "actions"
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
      <Typography variant="overline" className={classes.margin}>
        {students.length} student(s) in total
      </Typography>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={1}
        className={classes.margin}
      >
        <Grid item className={classes.grow}>
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
            <RoundedButton
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
            >
              Upload
            </RoundedButton>
          </UploadNominalRollWrapper>
        </Grid>
        <Grid item>
          <AddStudentModal
            paperId={paper.id}
            refreshStudents={getStudents}
            render={toggleVisibility => (
              <RoundedButton
                onClick={toggleVisibility}
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
              >
                Add
              </RoundedButton>
            )}
          />
        </Grid>
        <Grid item>
          <DeleteAllStudentsModal
            students={students}
            refreshStudents={callbackStudents}
            render={toggleVisibility => (
              <RoundedButton
                onClick={toggleVisibility}
                variant="contained"
                startIcon={<DeleteAllIcon />}
                className={classes.redButton}
              >
                Delete All
              </RoundedButton>
            )}
          />
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
