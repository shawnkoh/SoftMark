import { AxiosError } from "axios";
import * as Yup from "yup";
import { Formik } from "formik";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { toast } from "react-toastify";
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

import SvgSoftmarkLogo from "../../../components/svgr/SoftMarkLogo";
import { requestResetPassword } from "../../../api/users";

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
          Reset Password Request
        </Typography>
        <Formik
          validateOnBlur={false}
          initialValues={{ email: "" }}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            return requestResetPassword(values.email)
              .then(resp => {
                toast.success(`A reset link has been sent to ${values.email}`);
                resetForm({ email: "" });
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
            email: Yup.string()
              .email()
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
                  error={touched.email && !!errors.email}
                >
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    error={touched.email && !!errors.email}
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.email && !!errors.email && (
                    <FormHelperText>{errors.email}</FormHelperText>
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

export default withRouter(ForgotPasswordPage);
