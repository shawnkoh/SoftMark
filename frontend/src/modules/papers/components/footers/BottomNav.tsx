import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Check, People, Person, Settings } from "@material-ui/icons";
import { Link } from "react-router-dom";

type Props = RouteComponentProps;

const BottomNav: React.FC<Props> = ({ match: { params } }) => {
  const paper_id = +(params as { paper_id: string }).paper_id;
  const [value, setValue] = React.useState(0);

  return (
    <BottomNavigation
      color="secondary"
      value={value}
      onChange={(event: any, newValue: number) => {
        setValue(newValue);
      }}
      showLabels
    >
      <BottomNavigationAction
        color="primary"
        component={Link}
        //to={`/papers/${paper_id}/settings`}
        value="/Account"
        label="Account"
        icon={<Person />}
      />
      <BottomNavigationAction
        component={Link}
        //to={`/papers/${paper_id}/settings`}
        value="/settings"
        label="Settings"
        icon={<Settings />}
      />
      <BottomNavigationAction
        component={Link}
        //to={`/papers/${paper_id}/grading`}
        value="/grading"
        label="Grading"
        icon={<Check />}
      />
      <BottomNavigationAction
        component={Link}
        //to={`/papers/${paper_id}/students`}
        value="/students"
        label="Students"
        icon={<People />}
      />
    </BottomNavigation>
  );
};

export default withRouter(BottomNav);
