import * as React from "react";
import { Formik, FormikProps, FieldArray, Field } from "formik";
import { ObjectSchema } from "yup";

import {
  Button,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Tooltip
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ResetIcon from "@material-ui/icons/SettingsBackupRestoreRounded";

import { OptionsType } from "../../utils/options";
import RoundedButton from "../buttons/RoundedButton";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    button: {
      marginLeft: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  })
);

type GridSizeType =
  | boolean
  | "auto"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | undefined;

export interface AvatarMetaData {
  avatarSrc?: string;
  uploadPath: string;
}

export interface FormMetadataEntry {
  label?: string;
  formikFieldArrayFunction?: any;
  multiline?: boolean;
  required?: boolean;
  options?: OptionsType[] | null;
  disabled?: boolean;
  customInput?: (
    key: any,
    FormProps: FormikProps<any>
  ) => React.ReactElement<{
    key: number;
    label: string;
    onClick: React.ChangeEventHandler;
  }>;
  xs?: GridSizeType;
  sm?: GridSizeType;
  md?: GridSizeType;
  lg?: GridSizeType;
  xl?: GridSizeType;
}

export type FormMetadataType<T> = {
  [key in keyof Partial<T>]: FormMetadataEntry;
};

interface OwnProps<T extends object> {
  // The initial values of the form.
  initialValues: T;
  // Describes the UI and behavior of the avatar field.
  // Note: if this is set, initialValues should have 'avatar' in  it.
  avatarMetaData?: AvatarMetaData;
  // Describes the UI and behavior of the form fields.
  formMetadata: FormMetadataType<T>;
  // The Yup validation schema used for validating the form data.
  validationSchema: ObjectSchema<T>;
  // The function to be called when the cancel button is pressed.
  onCancel: () => any;
  // The function to be called when the submit button is pressed.
  // The function should resolve to a boolean that determines if the form is to be reset.
  onSubmit: (newValues: T) => Promise<boolean>;
  // whether to included reset button
  includeReset?: boolean;
}

type Props<T extends object> = OwnProps<T>;

/**
 * A SimpleForm displays a card containing a grid of form fields.
 */
const SimpleForm: React.FC<Props<any>> = ({
  initialValues,
  formMetadata,
  validationSchema,
  onCancel,
  onSubmit,
  includeReset
}) => {
  const classes = useStyles();

  const formKeys = Object.keys(formMetadata);

  return (
    <div className={classes.root}>
      <Grid container direction="column" justify="center" alignItems="stretch">
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
            const change = (n: any, e: any) => {
              e.persist();
              handleChange(e);
              setFieldTouched(n, true, false);
              return;
            };

            return (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                  {// Form fields
                  formKeys.map(key => {
                    const fields = formMetadata[key];
                    return (
                      <Grid
                        item
                        key={key}
                        xs={fields.xs}
                        sm={fields.sm}
                        md={fields.md}
                        lg={fields.lg}
                        xl={fields.xl}
                      >
                        {fields.customInput ? (
                          fields.customInput(key, FormProps)
                        ) : values[key] instanceof Array &&
                          !!fields.formikFieldArrayFunction ? (
                          <FieldArray name={key}>
                            {fields.formikFieldArrayFunction(
                              values[key],
                              FormProps
                            )}
                          </FieldArray>
                        ) : (
                          <TextField
                            id={key}
                            name={key}
                            helperText={touched[key] ? errors[key] : ""}
                            error={touched[key] && Boolean(errors[key])}
                            label={fields.label}
                            value={values && values[key] ? values[key] : ""}
                            onChange={change.bind(null, key)}
                            fullWidth
                            multiline={fields.multiline}
                            rows={fields.multiline ? "4" : undefined}
                            variant={
                              (!fields.multiline ? "filled" : "outlined") as any
                            }
                            margin="dense"
                            disabled={isSubmitting || fields.disabled}
                            // Select is true if options are not null
                            select={!!fields.options}
                            required={fields.required}
                          >
                            {!fields.options
                              ? null
                              : fields.options.map((option: any) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                          </TextField>
                        )}
                      </Grid>
                    );
                  })}
                  {/* Form buttons */}
                  <Grid
                    item
                    container
                    xs={12}
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                  >
                    {includeReset && (
                      <Grid item>
                        <Tooltip title="Reset">
                          <div>
                            <IconButton
                              type="button"
                              onClick={handleReset}
                              disabled={!dirty || isSubmitting}
                              size="medium"
                              color="primary"
                            >
                              <ResetIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </Grid>
                    )}
                    <Grid item>
                      <RoundedButton
                        variant="outlined"
                        size="medium"
                        onClick={onCancel}
                        className={classes.button}
                      >
                        Cancel
                      </RoundedButton>
                    </Grid>
                    <Grid item>
                      <RoundedButton
                        type="submit"
                        variant="contained"
                        disabled={!isValid || isSubmitting}
                        size="medium"
                        color="primary"
                        className={classes.button}
                      >
                        Submit
                      </RoundedButton>
                    </Grid>
                  </Grid>
                </Grid>
              </form>
            );
          }}
        </Formik>
      </Grid>
    </div>
  );
};

export default SimpleForm;
