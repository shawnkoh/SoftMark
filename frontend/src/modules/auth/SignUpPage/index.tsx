import React from "react";
import { RouteComponentProps } from "react-router";
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
import { Formik } from "formik";
import { AxiosError } from "axios";
import * as Yup from "yup";
import ReactGA from "react-ga";

import { createNewUser } from "api/users";
import SvgSoftmarkLogo from "components/svgr/SoftMarkLogo";
import { toast } from "react-toastify";

type Props = RouteComponentProps;
const SignUpPage: React.FC<Props> = props => {
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
          Register
        </Typography>
        <Formik
          validateOnBlur={false}
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
          }}
          onSubmit={(values, { setSubmitting }) => {
            return createNewUser(values.name, values.email, values.password)
              .then(resp => {
                ReactGA.event({
                  category: "User",
                  action: "Attempt to create an Account"
                });
                props.history.push("/login");
                toast.success(
                  `A verification link has been sent to ${values.email}`
                );
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
            name: Yup.string().required("Required"),
            email: Yup.string()
              .email()
              .required("Required"),
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
                  error={touched.name && !!errors.name}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    autoFocus
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                  />
                  {touched.name && !!errors.name && (
                    <FormHelperText>{errors.name}</FormHelperText>
                  )}
                </FormControl>

                <FormControl
                  fullWidth
                  margin="dense"
                  error={touched.email && !!errors.email}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
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
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
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
                  Register
                </Button>

                <Grid container>
                  <Grid item xs>
                    <Link href="/login" variant="body2">
                      {"Back to sign-in page"}
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

export default SignUpPage;
