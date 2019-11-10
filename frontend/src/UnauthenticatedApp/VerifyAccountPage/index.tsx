import React from "react";
import { useHistory, useParams } from "react-router";
import { toast } from "react-toastify";
import api from "../../api";
import LoadingSpinner from "../../components/LoadingSpinner";

const VerifyAccountPage: React.FC = () => {
  const history = useHistory();
  const { token } = useParams();

  const verifyEmail = async (token: string) => {
    const verified = await api.users.verifyEmail(token);
    if (verified) {
      toast.success("Successfully verified email!");
    } else {
      toast.error(
        "The email verification link has expired. Please request for another"
      );
    }
    history.push("/");
  };

  React.useEffect(() => {
    if (!token) {
      history.push("/");
      return;
    }
    verifyEmail(token);
  }, [token]);

  return <LoadingSpinner />;
};

export default VerifyAccountPage;
