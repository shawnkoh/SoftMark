import { Button, Grid, Link, TextField } from "@material-ui/core";
import { Formik } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { toast } from "react-toastify";
import * as Yup from "yup";
import api from "../../../api";
import { setUser } from "../../../store/auth/actions";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email()
    .required("Required"),
  password: Yup.string().required("Required"),
  name: Yup.string().required("Required")
});

const SignUpForm: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data } = await api.users.createNewUser(email, password, name);
      const { user } = data;
      dispatch(setUser(user));
      toast.success(
        `Welcome to SoftMark! A verification email has been sent to you`
      );
      history.push("/");
    } catch (error) {
      toast.error(
        `${email} is already registered. Consider resetting your password!`
      );
    }
  };

  return (
    <Formik
      validateOnBlur={false}
      initialValues={{
        email: "",
        password: "",
        name: ""
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await signUp(values.email, values.password, values.name);
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
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              <Grid item>
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
              </Grid>

              <Grid item>
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
              </Grid>

              <Grid item>
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
              </Grid>

              <Grid item>
                <Link href="/login" variant="body2">
                  {"Back to sign-in page"}
                </Link>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};

export default SignUpForm;
