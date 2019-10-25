import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Formik } from "formik";
import api from "../../../api";
import { AxiosError } from "axios";
import * as Yup from "yup";
import {
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  TextField,
  Typography
} from "@material-ui/core";
import useSnackbar from "../../../components/snackbar/useSnackbar";
import appLogo from "../../../assets/logo.png";
const queryString = require("query-string");

type RouteParams = {
  code: string;
  email: string;
};

type Props = RouteComponentProps;
const ResetPasswordPage: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const params: RouteParams = queryString.parse(props.location.search);

  return (
    <Container maxWidth="xs">
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        id="session"
      >
        <img className="app-logo mb-3" src={appLogo} alt="logo" />
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <Formik
          validateOnBlur={false}
          initialValues={{ password: "", confirmPassword: "" }}
          onSubmit={(values, { setSubmitting }) => {
            return api.users
              .resetPassword(params.email, params.code, values.password)
              .then(resp => {
                snackbar.showMessage(
                  `Your password has been reset successfully!`,
                  "Close"
                );
                props.history.push("/login");
              })
              .catch((error: AxiosError) => {
                const message = error.response
                  ? error.response.data.errors.detail
                  : "";
                snackbar.showMessage(message, "Close");
              })
              .finally(() => {
                setSubmitting(false);
              });
          }}
          validationSchema={Yup.object().shape({
            password: Yup.string().required("Required"),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref("password"), null], "Passwords don't match")
              .required("Required")
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
              <form className="l-form" onSubmit={handleSubmit}>
                <FormControl
                  fullWidth
                  margin="dense"
                  error={touched.password && !!errors.password}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    error={touched.password && !!errors.password}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                  />
                  {touched.password && !!errors.password && (
                    <FormHelperText>{errors.password}</FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  margin="dense"
                  error={touched.confirmPassword && !!errors.confirmPassword}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.confirmPassword}
                  />
                  {touched.confirmPassword && !!errors.confirmPassword && (
                    <FormHelperText>{errors.confirmPassword}</FormHelperText>
                  )}
                </FormControl>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="form-submit-btn"
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="/login" variant="body2">
                      Return to sign-in page
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

export default withRouter(ResetPasswordPage);
