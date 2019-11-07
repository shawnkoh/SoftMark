import React from "react";
import { useHistory, useLocation } from "react-router";

interface Props {
  isAuthenticated?: boolean;
}

export const NotFoundPage: React.FC<Props> = ({ isAuthenticated }) => {
  const history = useHistory();
  const { pathname } = useLocation();

  if (isAuthenticated && ["/login", "signup"].includes(pathname)) {
    history.push("/");
  }

  return <h1>Page not found!</h1>;
};

export default NotFoundPage;
