import React, { useEffect, useState } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Formik, FormikProps, FieldArray, Field } from "formik";
import { ObjectSchema } from "yup";

import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  IconButton,
  TextField,
  Tooltip
} from "@material-ui/core";
import Clear from "@material-ui/icons/Clear";
import Edit from "@material-ui/icons/Edit";
import ResetIcon from "@material-ui/icons/SettingsBackupRestoreRounded";
import Save from "@material-ui/icons/Save";

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
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item xs={6}>
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
                />
              </Grid>
              <Grid
                item
                xs={6}
                container
                direction="row"
                justify="flex-end"
                alignItems="center"
              >
                <Tooltip title="Save">
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!isValid || isSubmitting}
                  >
                    <Save />
                  </IconButton>
                </Tooltip>
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
                <IconButton onClick={() => setIsEditing(false)}>
                  <Clear />
                </IconButton>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  ) : (
    <Grid container direction="row" justify="space-between" alignItems="center">
      {initialText}
      <Tooltip title="Edit" onClick={() => setIsEditing(true)}>
        <IconButton>
          <Edit />
        </IconButton>
      </Tooltip>
    </Grid>
  );
};

export default SingleTextfieldForm;
