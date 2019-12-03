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
import UploadIcon from "@material-ui/icons/CloudUpload";
import AddIcon from "@material-ui/icons/PersonAdd";
import React, { useState } from "react";
import RoundedButton from "../../../../components/buttons/RoundedButton";
import SearchBar from "../../../../components/fields/SearchBar";
import { TableColumn } from "../../../../components/tables/TableTypes";
import UploadNominalRollWrapper from "../../../../components/uploadWrappers/UploadNominalRollWrapper";
import useScriptsAndStudents from "../../../../contexts/ScriptsAndStudentsContext";
import { StudentListData } from "../../../../types/paperUsers";
import AddStudentModal from "../modals/AddStudentModal";
import StudentsTableRow from "./StudentsTableRow";
import useStyles from "./styles";

const StudentsTable: React.FC = () => {
  const classes = useStyles();
  const scriptsAndStudents = useScriptsAndStudents();
  const { allStudents, unmatchedStudents } = scriptsAndStudents;

  const unmatchedStudentsIds = unmatchedStudents.map(student => student.id);

  const [searchText, setSearchText] = useState("");

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
      name: "Script filename",
      key: "scriptFilename"
    },
    {
      name: "Matching script?",
      key: "hasMatchingScript"
    },
    {
      name: "",
      key: "actions"
    }
  ];

  const filteredStudents = allStudents.filter(student => {
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
        {`${allStudents.length} student(s) in total ` +
          `(${unmatchedStudents.length} unmatched students)`}
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
          <UploadNominalRollWrapper>
            <RoundedButton
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
            >
              Upload students
            </RoundedButton>
          </UploadNominalRollWrapper>
        </Grid>
        <Grid item>
          <AddStudentModal
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
        {/* <Grid item>
          <DeleteAllStudentsModal
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
        </Grid> */}
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
            {filteredStudents.map((student: StudentListData) => {
              return (
                <StudentsTableRow
                  key={student.id}
                  student={student}
                  matched={!unmatchedStudentsIds.includes(student.id)}
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
