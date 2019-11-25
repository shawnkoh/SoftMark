import { Grid, Button, TableCell, TableRow, Tooltip } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useRouteMatch } from "react-router-dom";
import { getUser } from "../../../store/auth/selectors";
import BorderLinearProgress from "../../../components/BorderLinearProgress";

interface Props {
  questionTemplate: any;
}

const GradingTableRow: React.FC<Props> = props => {
  const currentUser = useSelector(getUser);
  const { url } = useRouteMatch()!;

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
