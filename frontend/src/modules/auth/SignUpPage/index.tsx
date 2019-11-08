import { Container, Grid, Typography } from "@material-ui/core";
import React from "react";
import SvgSoftmarkLogo from "../../../components/svgr/SoftMarkLogo";
import SignUpForm from "./SignUpForm";

const SignUpPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Grid
        alignItems="stretch"
        container
        direction="column"
        id="signUp"
        justify="center"
      >
        <Grid item>
          <SvgSoftmarkLogo />
        </Grid>

        <Grid item>
          <Typography component="h1" variant="h5">
            Create your account
          </Typography>
        </Grid>

        <Grid item>
          <SignUpForm />
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignUpPage;
