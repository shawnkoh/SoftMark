import { PaperData } from "backend/src/types/papers";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router";
import { toast } from "react-toastify";
import api from "../../api";
import LoadingSpinner from "../../components/LoadingSpinner";

const PaperContext = React.createContext<PaperData | null>(null);

export const PaperProvider: React.FC = props => {
  const { children } = props;
  const { paper_id } = useParams();
  const history = useHistory();
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refreshPaper = () => setRefreshFlag(refreshFlag + 1);

  if (!paper_id) {
    throw new Error("PaperProvider cannnot be used without paper_id");
  }

  const getPaper = async () => {
    try {
      const { data } = await api.papers.getPaper(Number(paper_id));
      const { paper } = data;
      setPaper(paper);
    } catch (error) {
      setPaper(null);
      setIsRejected(true);
      toast.error(
        "An error occured while trying to load the paper. Redirecting you to the home page."
      );
      history.push("/");
      // TODO: Handle this better, maybe go back to previous page
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getPaper();
  }, [paper_id]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2 possibilities: paper doesnt exist or user doesnt have permission
  // TODO: Make this nicer
  if (isRejected) {
    return (
      <div>
        <p>
          The Paper you are trying to access does not exist. Redirecting you to
          the home page
        </p>
      </div>
    );
  }

  return (
    <PaperContext.Provider value={paper}>{children}</PaperContext.Provider>
  );
};

export const usePaper = () => {
  const paper = useContext(PaperContext);
  if (!paper) {
    throw new Error("usePaper must be used within a PaperProvider");
  }
  return paper;
};

export default usePaper;
