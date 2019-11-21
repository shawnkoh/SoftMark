import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography
} from "@material-ui/core";
import DeleteAllIcon from "@material-ui/icons/DeleteForever";
import UploadIcon from "@material-ui/icons/CloudUpload";
import MatchIcon from "mdi-material-ui/ArrowCollapse";
import { ScriptListData } from "backend/src/types/scripts";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import RoundedButton from "../../../../components/buttons/RoundedButton";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { TableColumn } from "../../../../components/tables/TableTypes";
import UploadScriptsWrapper from "../../../../components/uploadWrappers/UploadScriptsWrapper";
import usePaper from "../../../../contexts/PaperContext";
import DeleteAllScriptsModal from "../modals/DeleteAllScriptsModal";
import ScriptsTableRow from "./ScriptTableRow";
import useStyles from "./styles";
import { toast } from "react-toastify";

const ScriptsTable: React.FC = () => {
  const paper = usePaper();
  const classes = useStyles();

  const [isLoadingScriptTemplate, setIsLoadingScriptTemplate] = useState(true);

  const [
    scriptTemplate,
    setScriptTemplate
  ] = useState<ScriptTemplateData | null>(null);

  const getScriptTemplate = async (paperId: number) => {
    const data = await api.scriptTemplates.getScriptTemplate(paper.id);
    setScriptTemplate(data);
  };

  useEffect(() => {
    getScriptTemplate(paper.id);
    setIsLoadingScriptTemplate(false);
  }, []);

  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  const getScripts = () => {
    api.scripts
      .getScripts(paper.id)
      .then(resp => {
        setScripts(resp.data.scripts);
      })
      .finally(() => setIsLoadingScripts(false));
  };

  useEffect(getScripts, []);

  const callbackScripts = () => {
    setTimeout(() => {
      getScripts();
    }, 2000);
  };

  const [searchText, setSearchText] = useState("");

  if (isLoadingScriptTemplate) {
    return <LoadingSpinner loadingMessage={`Loading script template...`} />;
  } else if (isLoadingScripts) {
    return <LoadingSpinner loadingMessage={`Loading scripts...`} />;
  }

  const columns: TableColumn[] = [
    {
      name: "Script (filename)",
      key: "scripts"
    },
    {
      name: "Pages",
      key: "pages"
    },
    {
      name: "Student matriculation number",
      key: "students"
    },
    {
      name: "Correct mapping verification",
      key: "verified"
    },
    {
      name: "",
      key: ""
    }
  ];

  const filteredScripts = scripts.filter(script => {
    const { filename, student } = script;
    const matriculationNumber =
      student && student.matriculationNumber ? student.matriculationNumber : "";
    const lowerCaseSearchText = searchText.toLowerCase();
    return (
      searchText === "" ||
      filename.toLowerCase().includes(lowerCaseSearchText) ||
      matriculationNumber.toLowerCase().includes(lowerCaseSearchText)
    );
  });

  return (
    <>
      <Typography variant="overline" className={classes.margin}>
        {scripts.length} script(s) in total
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
          <UploadScriptsWrapper
            paperId={paper.id}
            refreshScripts={getScripts}
          >
            <RoundedButton
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
            >
              Upload scripts
            </RoundedButton>
          </UploadScriptsWrapper>
        </Grid>
        <Grid item>
          <Tooltip title="Match students to scripts">
            <RoundedButton
              variant="contained"
              color="primary"
              startIcon={<MatchIcon />}
              onClick={() => {
                toast("Attempting to match scripts to students...");
                api.scripts
                  .matchScriptsToPaperUsers(paper.id)
                  .then(resp => {
                    setScripts([]);
                    getScripts();
                    toast.success("Matching algorithm ran successfully");
                  })
                  .catch(() => {
                    toast.error("An error occurred when matching.");
                  });
              }}
            >
              Match
            </RoundedButton>
          </Tooltip>
        </Grid>
        <Grid item>
          <DeleteAllScriptsModal
            refreshScripts={callbackScripts}
            render={toggleModal => (
              <RoundedButton
                onClick={toggleModal}
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
            {filteredScripts.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <br />
                  <div style={{ textAlign: "center" }}>No scripts found.</div>
                  <br />
                </TableCell>
              </TableRow>
            )}
            {filteredScripts.map(script => (
              <ScriptsTableRow
                key={script.id}
                scriptTemplatePagesCount={
                  scriptTemplate ? scriptTemplate.pageTemplates.length : -1
                }
                script={script}
                refreshScripts={getScripts}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default ScriptsTable;
