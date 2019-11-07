import queryString from "query-string";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";

import { verifyAccount } from "../../../api/users";
import LoadingSpinner from "../../../components/LoadingSpinner";

const VerifyAccountPage: React.FC = props => {
  const history = useHistory();
  const location = useLocation();
  const { code, email } = queryString.parse(location.search);

  useEffect(() => {
    // TODO: Create verify account route
    // verifyAccount(email, code)
    //   .then(resp => {
    //     ReactGA.event({
    //       category: "User",
    //       action: "Account is successfully created and verified"
    //     });
    //     toast.success("You account has been activated!");
    //   })
    //   .catch(error => {
    //     toast.error("Invalid account verification.");
    //   })
    //   .finally(() => {
    //     history.push("/");
    //   });
  }, [code, email]);

  return <LoadingSpinner />;
};

export default VerifyAccountPage;
