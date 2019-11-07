import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";

import { PaperData } from "backend/src/types/papers";

import { makeStyles } from "@material-ui/core/styles";

import LoadingSpinner from "../../components/LoadingSpinner";
import Header from "./components/headers/PaperSetupHeader";

const useStyles = makeStyles(theme => ({}));

interface OwnProps {
  paper: PaperData;
}

type Props = OwnProps & RouteComponentProps;

const QuestionAllocation: React.FC<Props> = ({ paper, match: { params } }) => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(true);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    setIsLoading(false);
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
