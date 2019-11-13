import { IconButton, TableCell, TableRow, Tooltip } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { RouteComponentProps, withRouter } from "react-router";
import usePaper from "contexts/PaperContext";

interface OwnProps {
  questionTemplate: any;
}

type Props = OwnProps & RouteComponentProps;

const GradingTableRow: React.FC<Props> = props => {
  const paper = usePaper();
  const paperId = paper.id;

  const { questionTemplate } = props;
  const {
    name,
    totalScore,
    markers,
    questionCount,
    markCount
  } = questionTemplate;

  return (
    <TableRow>
      <TableCell>Q{name}</TableCell>
      <TableCell>{totalScore}</TableCell>
      <TableCell>
        {markers.map(marker => {
          const userName = marker.name ? marker.name : "-";
          return (
            <>
              {userName}
              <br />
            </>
          );
        })}
      </TableCell>
      <TableCell>
        {Math.round((markCount / questionCount) * 100).toFixed(2)}%
      </TableCell>
      <TableCell>
        <Tooltip title={`Continue grading`}>
          <Link
            to={`/papers/${paperId}/grading/${questionTemplate.id}`}
            style={{ textDecoration: "none" }}
          >
            <IconButton>Grade</IconButton>
          </Link>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default withRouter(GradingTableRow);
