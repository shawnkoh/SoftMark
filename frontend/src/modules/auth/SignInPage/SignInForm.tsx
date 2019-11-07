import {
  Button,
  Grid,
  Link,
  Paper,
  TextField,
  Typography
} from "@material-ui/core";
import { Formik } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import * as yup from "yup";
import api from "../../../api";
import { setUser } from "../actions";

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string()
});

const SignInForm = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [passwordless, setPasswordless] = useState(true);
  const [sentPasswordlessEmail, setSentPasswordlessEmail] = useState(false);

  const passwordlessLogin = async (email: string) => {
    const status = await api.auth.passwordlessLogin(email);
    switch (status) {
      case 201:
        setSentPasswordlessEmail(true);
        toast.success("Sent email");
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
    console.log("signinform push papers");
    history.push("/");
  };

  if (sentPasswordlessEmail) {
    return <Paper>Sent email</Paper>;
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
          <form onSubmit={handleSubmit} className="l-form">
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="center"
              id="SignInForm"
            >
              <Grid item>
                <TextField
                  variant="outlined"
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
                />
              </Grid>

              {!passwordless && (
                <>
                  <Grid item>
                    <Link href="/password_reset" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>

                  <Grid item>
                    <TextField
                      variant="outlined"
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
                    />
                  </Grid>
                </>
              )}

              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="form-submit-btn"
                  disabled={isSubmitting}
                >
                  Log In
                </Button>
              </Grid>

              <Grid item>
                <Typography>
                  New to SoftMark?
                  <Link href="/signup" variant="body2">
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
