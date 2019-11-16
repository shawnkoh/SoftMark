import { Button, Grid, Typography } from "@material-ui/core";
import { InviteData, InvitePostData } from "backend/src/types/paperUsers";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import api from "../../../api";
import { setAuthenticationTokens } from "../../../api/client";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { setUser } from "../../../store/auth/actions";
import AcceptingForm from "./AcceptingForm";
import InvalidInviteSvg from "./undraw_feeling_blue_4b7q.svg";

interface Props {
  token: string;
}

const InviteForm: React.FC<Props> = ({ token }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [isCheckingInvite, setIsCheckingInvite] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isAccepting, setAccepting] = useState(false);

  useEffect(() => {
    const checkInvite = async () => {
      if (!token) {
        toast.error("No token provided");
        return;
      }

      try {
        const response = await api.paperUsers.checkInvite(token);
        setInviteData(response.data.invite);
      } catch (error) {
        setInviteData(null);
      }
      setIsCheckingInvite(false);
    };

    setIsCheckingInvite(true);
    checkInvite();
  }, [token]);

  if (isCheckingInvite) {
    return <LoadingSpinner />;
  }

  if (!inviteData) {
    return (
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item>
          <img
            src={InvalidInviteSvg}
            width={260}
            height={191.78}
            alt="Invalid Invite SVG"
          />
        </Grid>

        <Grid item>
          <Typography>Invite Invalid</Typography>
        </Grid>

        <Grid item>
          <Typography>
            This invite may be expired, or you might not have permission to
            join.
          </Typography>
        </Grid>

        <Grid item>
          <Button onClick={() => history.push("/")}>
            Continue to SoftMark
          </Button>
        </Grid>
      </Grid>
    );
  }

  const { paperName } = inviteData;

  const replyInvite = async (accepted: boolean, name: string | null) => {
    const postData: InvitePostData = {
      accepted,
      name
    };
    try {
      const { data } = await api.paperUsers.replyInvite(token, postData);
      setAuthenticationTokens(data);
      const user = await api.users.getOwnUser();
      dispatch(setUser(user));
      history.push("/");
    } catch (error) {
      toast.error(
        `An error occured while responding to the invite. Consider asking for another invite.`
      );
    }
  };

  if (isAccepting) {
    return <AcceptingForm inviteData={inviteData} replyInvite={replyInvite} />;
  }

  return (
    <Formik
      validateOnBlur={false}
      initialValues={{
        accepted: false
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await replyInvite(false, null);
        setSubmitting(false);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit
        } = props;

        return (
          <form className="l-form" onSubmit={handleSubmit}>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="stretch"
              spacing={2}
            >
              <Grid item>
                <Typography>You've been invited to join</Typography>
              </Grid>

              <Grid item>
                <Typography>{paperName}</Typography>
              </Grid>

              <Grid item>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="form-submit-btn"
                  disabled={isSubmitting}
                  onClick={() => {
                    setAccepting(true);
                  }}
                >
                  Join {paperName}
                </Button>
              </Grid>

              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  No Thanks
                </Button>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};

export default InviteForm;
