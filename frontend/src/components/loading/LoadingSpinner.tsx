import React from "react";
import { CircularProgress } from "@material-ui/core";

const LoadingSpinner: React.FC<any> = () => (
  <div>
    <CircularProgress />
  </div>
);

export default LoadingSpinner;
