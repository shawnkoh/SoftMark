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
import { makeStyles } from "@material-ui/core/styles";
import { ScriptListData } from "backend/src/types/scripts";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import ThemedButton from "../../../../components/buttons/ThemedButton";
import SearchBar from "../../../../components/fields/SearchBar";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { TableColumn } from "../../../../components/tables/TableTypes";
import UploadScriptsWrapper from "../../../../components/uploadWrappers/UploadScriptsWrapper";
import usePaper from "../../../../contexts/PaperContext";
import DeleteAllScriptsModal from "../modals/DeleteAllScriptsModal";
import ScriptsTableRow from "./ScriptTableRow";

const useStyles = makeStyles(theme => ({
  tableWrapper: {
    overflowX: "auto"
  },
  margin: {
    marginBottom: theme.spacing(1)
  }
}));

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
  const [refreshScriptsFlag, setRefreshScriptsFlag] = useState(0);
  const refreshScripts = () => {
    setTimeout(() => {
      setRefreshScriptsFlag(refreshScriptsFlag + 1);
    }, 300);
  };

  const getScripts = () => {
    api.scripts
      .getScripts(paper.id)
      .then(resp => {
        if (resp !== null) {
          setScripts(resp);
        }
      })
      .finally(() => setIsLoadingScripts(false));
  };

  useEffect(getScripts, [refreshScriptsFlag]);

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
      name: "Scripts (File name)",
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
      name: "Script to student verification",
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
          <UploadScriptsWrapper
            paperId={paper.id}
            refreshScripts={callbackScripts}
          >
            <ThemedButton label="Upload" filled />
          </UploadScriptsWrapper>
        </Grid>
        <Grid item>
          <DeleteAllScriptsModal
            scripts={scripts}
            refreshScripts={callbackScripts}
          />
        </Grid>
        <Grid item>
          <Tooltip title="Match students to scripts">
            <ThemedButton
              label="Match"
              filled
              onClick={() => {
                api.scripts.matchScriptsToPaperUsers(paper.id).then(resp => {
                  setScripts([]);
                  getScripts();
                });
              }}
            />
          </Tooltip>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">
            Total scripts: {scripts.length}
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
