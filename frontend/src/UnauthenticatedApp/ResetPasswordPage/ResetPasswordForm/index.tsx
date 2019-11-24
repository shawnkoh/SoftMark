import {
  FormControl,
  FormHelperText,
  Grid,
  Link,
  TextField
} from "@material-ui/core";
import { Formik } from "formik";
import React from "react";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import * as Yup from "yup";
import api from "../../../api";
import RoundedButton from "../../../components/buttons/RoundedButton";

interface Props {
  token: string;
}

const validationSchema = Yup.object().shape({
  password: Yup.string().required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords don't match")
    .required("Required")
});

const ResetPasswordForm: React.FC<Props> = ({ token }) => {
  const history = useHistory();

  const resetPassword = async (token: string, password: string) => {
    const reseted = await api.users.resetPassword(token, password);
    if (!reseted) {
      toast.error(
        "The reset password token has expired. Please request for another."
      );
      history.push("/reset_password");
      return;
    }
    toast.success("Your password has been reset successfully!");
    history.push("/");
  };

  return (
    <Formik
      validateOnBlur={false}
      initialValues={{ password: "", confirmPassword: "" }}
      onSubmit={(values, { setSubmitting }) => {
        resetPassword(token, values.password);
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
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="stretch"
              spacing={2}
            >
              <Grid item>
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
              </Grid>
              <Grid item>
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
              </Grid>
              <Grid item>
                <RoundedButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="form-submit-btn"
                  disabled={isSubmitting}
                >
                  Submit
                </RoundedButton>
              </Grid>
              <Grid item>
                <Link href="/login" variant="body2">
                  Return to sign-in page
                </Link>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};

export default ResetPasswordForm;
