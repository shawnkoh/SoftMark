import { StudentListData } from "../../types/paperUsers";
import { ScriptListData } from "backend/src/types/scripts";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import api from "../../api";
import LoadingSpinner from "../../components/LoadingSpinner";

type ScriptsAndStudentsContextProps =
  | ({
      allStudents: StudentListData[];
      refreshAllStudents: () => void;
      unmatchedStudents: StudentListData[];
      refreshUnmatchedStudents: () => void;
      scripts: ScriptListData[];
      refreshScripts: () => void;
      matchScriptsToStudents: () => void;
    })
  | null;

const ScriptsAndStudentsContext = React.createContext<
  ScriptsAndStudentsContextProps
>(null);

export const ScriptsAndStudentsProvider: React.FC = props => {
  const { children } = props;
  const { paper_id } = useParams();

  if (!paper_id) {
    throw new Error(
      "ScriptsAndStudentsProvider cannnot be used without paper_id"
    );
  }

  const paperId = Number(paper_id);

  const [isRejected, setIsRejected] = useState(false);

  const [allStudents, setAllStudents] = useState<StudentListData[]>([]);
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(true);

  const getStudents = () => {
    api.paperUsers
      .getStudents(paperId)
      .then(resp => {
        setAllStudents(resp.data.paperUsers);
      })
      .catch(() => {
        setIsRejected(true);
        toast.error("An error occured while trying to load the students.");
      })
      .finally(() => setIsLoadingAllStudents(false));
  };

  useEffect(getStudents, [paper_id]);

  const [unmatchedStudents, setUnmatchedStudents] = useState<StudentListData[]>(
    []
  );

  const getUnmatchedStudents = () => {
    api.paperUsers.getUnmatchedStudents(paperId).then(resp => {
      setUnmatchedStudents(resp.data.paperUsers);
    });
  };

  useEffect(getUnmatchedStudents, [paper_id]);

  const [scripts, setScripts] = useState<ScriptListData[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  const getScripts = () => {
    api.scripts
      .getScripts(paperId)
      .then(resp => {
        setScripts(resp.data.scripts);
      })
      .finally(() => setIsLoadingScripts(false));
  };

  useEffect(getScripts, [paper_id]);

  const matchScriptsToStudents = () => {
    toast("Attempting to match scripts to students...");
    api.scripts
      .matchScriptsToPaperUsers(paperId)
      .then(resp => {
        setScripts([]);
        getScripts();
        toast.success("Matching algorithm ran successfully");
      })
      .catch(() => {
        toast.error("An error occurred when matching.");
      });
  };

  if (isLoadingAllStudents) {
    return <LoadingSpinner loadingMessage="Loading students..." />;
  } else if (isLoadingScripts) {
    return <LoadingSpinner loadingMessage="Loading scripts..." />;
  }

  if (isRejected) {
    return (
      <div>
        <p>The Paper you are trying to access does not exist.</p>
      </div>
    );
  }

  return (
    <ScriptsAndStudentsContext.Provider
      value={
        paperId
          ? {
              allStudents,
              refreshAllStudents: getStudents,
              unmatchedStudents,
              refreshUnmatchedStudents: getUnmatchedStudents,
              scripts,
              refreshScripts: getScripts,
              matchScriptsToStudents
            }
          : null
      }
    >
      {children}
    </ScriptsAndStudentsContext.Provider>
  );
};

export const useScriptsAndStudents = () => {
  const scriptsAndStudents = useContext(ScriptsAndStudentsContext);
  if (!scriptsAndStudents) {
    throw new Error(
      "useStudents must be used within a ScriptsAndStudentsProvider"
    );
  }
  return scriptsAndStudents;
};

export default useScriptsAndStudents;
