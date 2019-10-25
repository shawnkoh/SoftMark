import * as React from "react";
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from "react-router-dom";
import MainLayout from "./MainLayout";
import PaperIndex from "../../modules/papers/components/pages/PaperIndex";
import PaperView from "../../modules/papers/components/pages/PaperView";
import api from "../../api";
import { setCurrentUser, setCurrentToken } from "../../modules/session/actions";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as session from "../../modules/session";
import LoadingIcon from "../icons/LoadingIcon";

type Props = RouteComponentProps;
const MainAppPages: React.FC<Props> = props => {
  // Generic routes
  const paperIndexRoute = <Route exact path="/papers" component={PaperIndex} />;
  const paperViewRoute = (
    <Route exact path="/papers/:paper_id" component={PaperView} />
  );
  /* const questionAllocationRoute = (
    <Route exact path="/papers/:paper_id/question_allocation" component={PaperView} />
  );*/

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useSelector(session.selectors.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(false);
    } else {
      api.auth
        .silentSignIn()
        .then(resp => {
          dispatch(setCurrentToken(resp.data));
        })
        .catch(error => {
          console.log("Not logged in.");
          props.history.push("/login");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [dispatch, isLoggedIn]);

  if (isLoading) {
    return <LoadingIcon />;
  } else {
    return (
      <MainLayout>
        <Switch>
          {paperIndexRoute}
          {paperViewRoute}
        </Switch>
      </MainLayout>
    );
  }
};

export default withRouter(MainAppPages);
