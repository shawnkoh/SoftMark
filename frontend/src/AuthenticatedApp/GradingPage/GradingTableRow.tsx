import { IconButton, TableCell, TableRow, Tooltip } from "@material-ui/core";
import { QuestionTemplateRootData } from "backend/src/types/questionTemplates";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";

interface OwnProps {
  questionTemplate: QuestionTemplateRootData;
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
