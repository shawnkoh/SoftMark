import { Grid, IconButton, TextField, Tooltip } from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Clear";
import DoneIcon from "@material-ui/icons/Done";
import EditIcon from "@material-ui/icons/Edit";
import { Formik, FormikProps } from "formik";
import React, { useState } from "react";
import { ObjectSchema } from "yup";
import red from "@material-ui/core/colors/red";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    red: {
      color: red[500]
    }
  })
);

interface OwnProps {
  // The initial values of the form.
  fieldName: string;
  // The initial values of the form.
  initialText: string;
  // The Yup validation schema used for validating the form data.
  validationSchema: ObjectSchema;
  // The function to be called when the submit button is pressed.
  // The function should resolve to a boolean that determines if the form is to be reset.
  onSubmit: (newValues: any) => Promise<boolean>;
}

type Props = OwnProps;

const SingleTextfieldForm: React.FC<Props> = ({
  fieldName,
  initialText,
  validationSchema,
  onSubmit
}) => {
  const classes = useStyles();

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const initialValues = {};
  initialValues[fieldName] = initialText;

  return isEditing ? (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(newValues, actions) => {
        actions.setSubmitting(true);

        const { ...others } = newValues;
        onSubmit(others)
          .then(bool => {
            if (bool) {
              actions.setSubmitting(false);
              actions.resetForm();
              actions.setStatus({ success: true });
            }
            setIsEditing(false);
          })
          .catch(() => {
            actions.setSubmitting(false);
            actions.setStatus({ success: false });
          });
      }}
    >
      {(FormProps: FormikProps<any>) => {
        const {
          values,
          touched,
          errors,
          dirty,
          isSubmitting,
          setSubmitting,
          handleChange,
          handleSubmit,
          handleReset,
          resetForm,
          setStatus,
          isValid,
          setFieldTouched
        } = FormProps;

        return (
          <form onSubmit={handleSubmit}>
            <Grid container direction="row" alignItems="center">
              <Grid item style={{ flexGrow: 1 }}>
                <TextField
                  id={fieldName}
                  key={fieldName}
                  helperText={touched[fieldName] ? errors[fieldName] : ""}
                  error={touched[fieldName] && !!errors[fieldName]}
                  value={values[fieldName]}
                  onChange={handleChange}
                  variant="filled"
                  margin="dense"
                  disabled={isSubmitting}
                  label="Filename"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Tooltip title="Done">
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!isValid || isSubmitting}
                  >
                    <DoneIcon />
                  </IconButton>
                </Tooltip>
                {/*
                <Tooltip title="Reset">
                  <IconButton
                    type="button"
                    onClick={handleReset}
                    disabled={!dirty || isSubmitting}
                    size="medium"
                    color="primary"
                  >
                    <ResetIcon />
                  </IconButton>
                </Tooltip>
                */}
                <Tooltip title="Cancel">
                  <IconButton
                    onClick={event => {
                      handleReset(event);
                      setIsEditing(false);
                    }}
                    className={classes.red}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  ) : (
    <Grid container direction="row" alignItems="center">
      {initialText}
      <Tooltip title="Edit" onClick={() => setIsEditing(true)}>
        <IconButton>
          <EditIcon />
        </IconButton>
      </Tooltip>
    </Grid>
  );
};

export default SingleTextfieldForm;
