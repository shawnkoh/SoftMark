import React from "react";
import { CircularProgress } from "@material-ui/core";

const LoadingIcon: React.FC<any> = () => {
  return (
    <div>
      <CircularProgress />
    </div>
  );
};

export default LoadingIcon;
