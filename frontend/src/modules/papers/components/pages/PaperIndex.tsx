import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { AppState } from "../../../../types/store";
import { Typography } from "@material-ui/core";
import api from "../../../../api";
import { AxiosResponse } from "axios";
import LoadingIcon from "../../../../components/icons/LoadingIcon";

type Props = RouteComponentProps;

const PaperIndex: React.FC<Props> = ({ match: { params, url } }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <LoadingIcon />;
  }

  return (
    <>
      <Typography variant="h5" align="center">
        this is the paper index page
      </Typography>
    </>
  );
};

export default withRouter(PaperIndex);
