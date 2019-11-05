import React from "react";
import { CircularProgress } from "@material-ui/core";

interface OwnProps {
  loadingMessage?: string;
}

type Props = OwnProps;

const LoadingSpinner: React.FC<Props> = ({ loadingMessage = "" }) => (
  <div>
    <CircularProgress />
    {loadingMessage}
  </div>
);

export default LoadingSpinner;
