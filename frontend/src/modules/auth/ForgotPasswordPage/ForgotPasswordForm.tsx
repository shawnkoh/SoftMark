import { Button, Grid, Link, TextField } from "@material-ui/core";
import { Formik } from "formik";
import React from "react";
import { toast } from "react-toastify";
import * as yup from "yup";
import api from "../../../api";

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required("Required")
});

const ForgotPasswordForm: React.FC = () => {
  const requestResetPassword = async (email: string) => {
    const requested = await api.users.requestResetPassword(email);
    if (!requested) {
      toast.error("The email address provided is not a user");
      return;
    }
    toast.success(`An email to reset the password has been sent to ${email}.`);
  };

  return (
    <Formik
      validateOnBlur={false}
      initialValues={{ email: "" }}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        requestResetPassword(values.email);
        resetForm({ email: "" });
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
          <form className="l-form" onSubmit={handleSubmit}>
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

            <Grid item>
              <Link href="/login" variant="body2">
                Return to sign-in page
              </Link>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};

export default ForgotPasswordForm;
