import { AxiosError } from "axios";
import { Formik } from "formik";
import queryString from "query-string";
import React from "react";
import {
  RouteComponentProps,
  Redirect,
  useHistory,
  useLocation
} from "react-router";
import { toast } from "react-toastify";
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

import api from "api";
import SvgSoftmarkLogo from "components/svgr/SoftMarkLogo";
import LoadingSpinner from "components/LoadingSpinner";

type Props = RouteComponentProps;

const ResetPasswordPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { code, email } = queryString.parse(location.search);

  if (typeof code !== "string" || typeof email !== "string") {
    return <Redirect to="/" />;
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
        <Formik
          validateOnBlur={false}
          initialValues={{ password: "", confirmPassword: "" }}
          onSubmit={(values, { setSubmitting }) => {
            return api.users
              .resetPassword(email, code, values.password)
              .then(resp => {
                toast.success(`Your password has been reset successfully!`);
                history.push("/login");
              })
              .catch((error: AxiosError) => {
                const message = error.response
                  ? error.response.data.errors.detail
                  : "";
                toast.error(message);
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

export default ResetPasswordPage;
