import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { QuestionTemplateListData } from "backend/src/types/questionTemplates";

import { makeStyles } from "@material-ui/core/styles";
import { IconButton, TableRow, TableCell, Tooltip } from "@material-ui/core";

interface OwnProps {
  questionTemplate: QuestionTemplateListData;
}

type Props = OwnProps & RouteComponentProps;

const GradingTableRow: React.FC<Props> = props => {
  return (
    <TableRow>
      <TableCell>question label</TableCell>
      <TableCell>marks</TableCell>
      <TableCell>name</TableCell>
      <TableCell>progress</TableCell>
      <TableCell>
        <Tooltip title={`Continue grading`}>
          <IconButton onClick={() => props.history.push(`to_the_next_script`)}>
            Grade
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default withRouter(GradingTableRow);
