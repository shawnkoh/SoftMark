import React, { useEffect } from "react";
import { useHistory, useLocation, useParams } from "react-router";
import LoadingSpinner from "../../../components/LoadingSpinner";

const VerifyAccountPage: React.FC = props => {
  const history = useHistory();
  const location = useLocation();
  const { token } = useParams();

  if (!token) {
    history.push("/");
    return <LoadingSpinner />;
  }

  // useEffect(() => {
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
  // }, [token]);

  return <LoadingSpinner />;
};

export default VerifyAccountPage;
