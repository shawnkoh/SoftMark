import React from "react";
import { RouteComponentProps } from "react-router";
import {
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  TextField,
  Typography
} from "@material-ui/core";

import appLogo from "../../../assets/logo.png";
import { useDispatch } from "react-redux";
import { setCurrentUser, setCurrentToken } from "../actions";
import api from "../../../api";
import { AxiosError } from "axios";
import { Formik } from "formik";
import * as Yup from "yup";
import useSnackbar from "../../../components/snackbar/useSnackbar";

type Props = RouteComponentProps;
const SignInPage: React.FC<Props> = props => {
  const dispatch = useDispatch();
  const snackbar = useSnackbar();

  return (
    <Container maxWidth="xs">
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        id="session"
      >
        <img src={appLogo} alt="logo" />
        <br />
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        <Formik
          validateOnBlur={false}
          initialValues={{ email: "", password: "", rememberMe: false }}
          onSubmit={(values, { setSubmitting }) => {
            return api.auth
              .signIn(values.email, values.password)
              .then(resp => {
                dispatch(setCurrentToken(resp.data));
                props.history.push("/papers");
              })
              .catch((error: AxiosError) => {
                snackbar.showMessage("error", "Close");
              })
              .finally(() => {
                setSubmitting(false);
              });
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email()
              .required("Required"),
            password: Yup.string().required("Required"),
            rememberMe: Yup.bool().required()
          })}
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
                <FormControl
                  fullWidth
                  margin="dense"
                  error={touched.email && !!errors.email}
                >
                  <TextField
                    variant="outlined"
                    required
                    id="email"
                    error={touched.email && !!errors.email}
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && !!errors.email && (
                    <FormHelperText>{errors.email}</FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  margin="dense"
                  error={touched.password && !!errors.password}
                >
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
                  {touched.password && !!errors.password && (
                    <FormHelperText id="component-error-text">
                      {errors.password}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      id="rememberMe"
                      color="primary"
                      value={values.rememberMe}
                      onChange={handleChange}
                    />
                  }
                  onBlur={handleBlur}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="form-submit-btn"
                  disabled={isSubmitting}
                >
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="/signup" variant="body2">
                      Register
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/forgotpassword" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                </Grid>
              </form>
            );
          }}
        </Formik>
      </Grid>
    </Container>
  );
};

export default SignInPage;
