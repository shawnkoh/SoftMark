import React from "react";
import * as Yup from "yup";
import api from "../../../../api";
import { IconButton } from "@material-ui/core";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@material-ui/icons";

interface OwnProps {
  pageNo: number;
  incrementPageNo: () => void;
  decrementPageNo: () => void;
}

type Props = OwnProps;

const TogglePageComponent: React.FC<Props> = ({
  pageNo,
  incrementPageNo,
  decrementPageNo
}) => {
  return (
    <>
      <IconButton color="primary" onClick={decrementPageNo}>
        <ArrowLeftOutlined />
      </IconButton>
      {pageNo}
      <IconButton color="primary" onClick={incrementPageNo}>
        <ArrowRightOutlined />
      </IconButton>
    </>
  );
};

export default TogglePageComponent;
