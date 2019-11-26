import { Button, Grid, TableCell, TableRow, Tooltip } from "@material-ui/core";
import {
  MarkerGradingData,
  QuestionTemplateGradingRootData
} from "backend/src/types/grading";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useRouteMatch } from "react-router-dom";
import BorderLinearProgress from "../../../components/BorderLinearProgress";
import { getUser } from "../../../store/auth/selectors";

interface Props {
  questionTemplate: QuestionTemplateGradingRootData;
  markers: MarkerGradingData[];
}

const GradingTableRow: React.FC<Props> = props => {
  const { markers, questionTemplate } = props;
  const { name, totalScore, questionCount, markCount } = questionTemplate;
  const { url } = useRouteMatch()!;
  const currentUser = useSelector(getUser);

  return (
    <TableRow>
      <TableCell>Q{name}</TableCell>
      <TableCell>{totalScore}</TableCell>
      <TableCell>
        {markers.map(marker => {
          return (
            <>
              {marker.name || `Pending <${marker.email}>`}
              <br />
            </>
          );
        })}
      </TableCell>
      <TableCell>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={6}>
            {`${markCount}/${questionCount} (${(
              markCount / questionCount
            ).toLocaleString(undefined, {
              style: "percent"
            })}) of questions marked`}
          </Grid>
          <Grid item xs={12} sm={6}>
            <BorderLinearProgress
              value={(markCount / questionCount) * 100}
              color="secondary"
              variant="determinate"
            />
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>
        {currentUser && markers.some(marker => marker.id === currentUser.id) && (
          <Tooltip title={`Continue grading`}>
            <Button
              component={Link}
              to={`${url}/${questionTemplate.id}`}
              variant="contained"
              color="primary"
              style={{ borderRadius: 24 }}
              disabled={markCount === questionCount}
            >
              Mark
            </Button>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

export default GradingTableRow;
