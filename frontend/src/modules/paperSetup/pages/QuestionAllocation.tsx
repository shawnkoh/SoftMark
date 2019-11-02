import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { PaperData } from "backend/src/types/papers";
import api from "../../../api";

import { makeStyles } from "@material-ui/core/styles";

import Header from "../components/headers/PaperSetupHeader";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

const useStyles = makeStyles(theme => ({}));

type Props = RouteComponentProps;

const QuestionAllocation: React.FC<Props> = ({ match: { params } }) => {
  const classes = useStyles();
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(true);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);
  const [paper, setPaper] = useState<PaperData | null>(null);

  useEffect(() => {
    api.papers
      .getPaper(paper_id)
      .then(resp => {
        setPaper(resp.data.paper);
      })
      .finally(() => setIsLoading(false));
  }, [refreshFlag]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Header paper={paper} title="Question Allocation" />
      <main>Question allocation page</main>
    </>
  );
};

export default withRouter(QuestionAllocation);
