import {
  Button,
  Grid,
  Link,
  Paper,
  TextField,
  Theme,
  Typography,
  withStyles
} from "@material-ui/core";
import { Formik } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import * as yup from "yup";
import api from "../../api";
import { setUser } from "../../store/auth/actions";
import MailSentSvg from "./undraw_Mail_sent_qwwx.svg";

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string()
});

const ThemedTextField = withStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.common.white
  }
}))(TextField);

const SignInForm = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [passwordless, setPasswordless] = useState(true);
  const [sentPasswordlessEmail, setSentPasswordlessEmail] = useState(false);
  const [email, setEmail] = useState("");

  const passwordlessLogin = async (email: string) => {
    const status = await api.auth.passwordlessLogin(email);
    switch (status) {
      case 201:
        setSentPasswordlessEmail(true);
        setEmail(email);
        break;
      case 403:
        setPasswordless(false);
        toast.info("Please enter your password");
        break;
      case 404:
        toast.error("Incorrect username or email");
        break;
    }
  };

  const passwordLogin = async (email: string, password: string) => {
    const loggedIn = await api.auth.passwordLogin(email, password);
    if (!loggedIn) {
      toast.error("Incorrect username or password");
      return;
    }
    const user = await api.users.getOwnUser();
    if (!user) {
      toast.error("Something went wrong");
      return;
    }
    dispatch(setUser(user));
    history.push("/");
  };

  if (sentPasswordlessEmail) {
    return (
      <Paper>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <Typography align="center" color="primary" variant="h4">
              You've Got Mail!
            </Typography>
          </Grid>

          <Grid item>
            <img src={MailSentSvg} width={131.4} height={119.8} />
          </Grid>

          <Grid item>
            <Typography align="center" variant="subtitle1">
              We sent a login link to:
            </Typography>
            <Typography align="center" variant="h6">
              {email}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  return (
    <Formik
      validateOnBlur={false}
      initialValues={{ email: "", password: "" }}
      onSubmit={async (values, { setSubmitting }) => {
        passwordless
          ? await passwordlessLogin(values.email)
          : await passwordLogin(values.email, values.password);
        setSubmitting(false);
      }}
      validationSchema={validationSchema}
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
          <form onSubmit={handleSubmit}>
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="stretch"
              id="SignInForm"
              spacing={2}
            >
              <Grid item>
                <TextField
                  fullWidth
                  required
                  id="email"
                  error={touched.email && !!errors.email}
                  label="E-mail"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                />
              </Grid>

              {!passwordless && (
                <>
                  <Grid item>
                    <TextField
                      required
                      fullWidth
                      error={touched.password && !!errors.password}
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item>
                    <Link href="/reset_password" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                </>
              )}

              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Log In
                </Button>
              </Grid>

              <Grid item>
                <Typography variant="body1">
                  New to SoftMark?{" "}
                  <Link href="/signup" variant="body1">
                    Create an account.
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};

export default SignInForm;
