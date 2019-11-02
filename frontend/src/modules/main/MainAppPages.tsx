import * as React from "react";
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from "react-router-dom";
import MainLayout from "./MainLayout";
import PaperIndex from "../papers/pages/PaperIndex";
import PaperView from "../papers/pages/PaperView";
import ScriptTemplateView from "../scripts/pages/ScriptTemplateView";
import ScriptView from "../scripts/pages/ScriptView";
import api from "../../api";
import { setCurrentUser, setCurrentToken } from "../session/actions";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as session from "../session";

import LoadingSpinner from "../../components/loading/LoadingSpinner";

type Props = RouteComponentProps;
const MainAppPages: React.FC<Props> = props => {
  // Generic routes
  const paperIndexRoute = <Route exact path="/papers" component={PaperIndex} />;
  const paperViewRoute = (
    <Route path="/papers/:paper_id" component={PaperView} />
  );
  const scriptViewRoute = (
    <Route exact path="/scripts/:script_id" component={ScriptView} />
  );
  const scriptTemplateViewRoute = (
    <Route
      exact
      path="/papers/:paper_id/script_template"
      component={ScriptTemplateView}
    />
  );

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
    return <LoadingSpinner />;
  } else {
    return (
      <MainLayout>
        <Switch>
          {scriptTemplateViewRoute}
          {paperIndexRoute}
          {paperViewRoute}
          {scriptViewRoute}
        </Switch>
      </MainLayout>
    );
  }
};

export default withRouter(MainAppPages);
