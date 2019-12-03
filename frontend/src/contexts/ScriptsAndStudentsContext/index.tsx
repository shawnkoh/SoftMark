import { ScriptListData } from "backend/src/types/scripts";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import api from "../../api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { StudentListData } from "../../types/paperUsers";

type ScriptsAndStudentsContextProps =
  | ({
      isLoadingScripts: boolean;
      allStudents: StudentListData[];
      refreshAllStudents: () => void;
      unmatchedStudents: StudentListData[];
      refreshUnmatchedStudents: () => void;
      scripts: ScriptListData[];
      refreshScripts: () => void;
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

  const getScripts = async () => {
    try {
      const response = await api.scripts.getScripts(paperId);
      setScripts(response.data.scripts);
    } catch (error) {
      toast.error(
        "An unexpected error occured while fetching the scripts. Please refresh."
      );
    }
  };

  useEffect(() => {
    setIsLoadingScripts(true);
    getScripts();
    setIsLoadingScripts(false);
  }, [paper_id]);

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
              isLoadingScripts,
              allStudents,
              refreshAllStudents: getStudents,
              unmatchedStudents,
              refreshUnmatchedStudents: getUnmatchedStudents,
              scripts,
              refreshScripts: getScripts
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
