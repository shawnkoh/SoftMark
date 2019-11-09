import React from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import { toast } from "react-toastify";
import api from "../../../api";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { setUser } from "../actions";

const PasswordlessPage: React.FC = () => {
  const { token } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  const tokenLogin = async (token: string) => {
    const loggedIn = await api.auth.tokenLogin(token);
    if (loggedIn) {
      toast.success("Successfully logged in!");
    } else {
      toast.error(
        "Failed to log in. Your email login has expired. Please try to log in again"
      );
    }
    const user = await api.users.getOwnUser();
    if (!user) {
      toast.error("An error occured while retrieving UserData");
      console.error("An error occured while retrieving UserData");
      return;
    }
    dispatch(setUser(user));
    history.push("/");
  };

  if (token) {
    tokenLogin(token);
  }

  // TODO: Should have a proper page instead
  return <LoadingSpinner />;
};

export default PasswordlessPage;
