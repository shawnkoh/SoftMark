import { Container, Grid, Typography } from "@material-ui/core";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import SvgSoftmarkLogo from "../../../components/svgr/SoftMarkLogo";
import ForgotPasswordForm from "./ForgotPasswordForm";

type Props = RouteComponentProps;
const ForgotPasswordPage: React.FC<Props> = props => {
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
        <ForgotPasswordForm />
      </Grid>
    </Container>
  );
};

export default withRouter(ForgotPasswordPage);
