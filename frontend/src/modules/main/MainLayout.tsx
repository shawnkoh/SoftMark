import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import Header from "./Header";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

type Props = RouteComponentProps;
const MainLayout: React.FC<Props> = props => {
  const dispatch = useDispatch();

  return <div>{props.children}</div>;
};

export default withRouter(MainLayout);
