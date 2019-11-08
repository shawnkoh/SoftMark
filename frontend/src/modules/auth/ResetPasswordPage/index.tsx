import { Container, Grid, Typography } from "@material-ui/core";
import React from "react";
import { useHistory, useParams } from "react-router";
import LoadingSpinner from "../../../components/LoadingSpinner";
import SvgSoftmarkLogo from "../../../components/svgr/SoftMarkLogo";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPasswordPage: React.FC = () => {
  const history = useHistory();
  const { token } = useParams();

  if (!token) {
    history.push("/");
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="xs">
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        id="session"
      >
        <SvgSoftmarkLogo />
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <ResetPasswordForm token={token} />
      </Grid>
    </Container>
  );
};

export default ResetPasswordPage;
