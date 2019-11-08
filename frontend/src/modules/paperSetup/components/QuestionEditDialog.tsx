import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  DialogActions,
  Button,
  makeStyles,
  Fab
} from "@material-ui/core";
import { Formik, FormikProps, Form, Field, FieldProps } from "formik";
import { isPageValid } from "../../../utils/questionAllocationUtil";
import ConfirmationDialog from "../../../components/dialogs/ConfirmationDialog";

export interface NewQuestionValues {
  title: string;
  score: number;
  pageCovered: string;
}

export interface QuestionEditDialogProps {
  open: boolean;
  handleClose: (e?: any) => void;
  initialValues: NewQuestionValues;
  onSubmit: (values: NewQuestionValues) => Promise<any>;
  handleDelete?: () => Promise<any>;
  currentPage: number;
  pageCount: number;
}

type Props = QuestionEditDialogProps;

const QuestionEditDialog: React.FC<Props> = props => {
  const [deleteWarning, setDeleteWarning] = React.useState(false);
  return (
    <Dialog open={props.open} onClose={props.handleClose}>
      <Formik
        initialValues={props.initialValues}
        onSubmit={(values, actions) => {
          props.onSubmit(values);
          actions.setSubmitting(false);
          actions.resetForm();
          props.handleClose();
        }}
      >
        {(formikProps: FormikProps<NewQuestionValues>) => (
          <Form>
            <DialogTitle>
              {props.handleDelete
                ? `Editing ${props.initialValues.title}`
                : "Add Question"}
            </DialogTitle>
            <DialogContent>
              <Grid container justify="flex-start" spacing={2}>
                <Grid item xs>
                  <Field name="title" validate={value => !value && "Required"}>
                    {({ field, meta }: FieldProps<NewQuestionValues>) => (
                      <TextField
                        error={!!meta.error}
                        autoFocus
                        margin="dense"
                        label="Title"
                        helperText={meta.error || "e.g. Q1a"}
                        required
                        {...field}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs>
                  <Field
                    name="score"
                    validate={value =>
                      value < 0 && "Score should be non-negative"
                    }
                  >
                    {({ field, meta }: FieldProps<NewQuestionValues>) => (
                      <TextField
                        error={!!meta.error}
                        margin="dense"
                        label="Score"
                        helperText={meta.error}
                        type="number"
                        required
                        {...field}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid container item>
                  <Field
                    name="pageCovered"
                    validate={value =>
                      isPageValid(value, props.currentPage, props.pageCount)
                    }
                  >
                    {({ field, meta }: FieldProps<NewQuestionValues>) => (
                      <TextField
                        error={!!meta.error}
                        margin="dense"
                        label="Page Covered"
                        helperText={meta.error}
                        required
                        fullWidth
                        {...field}
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {props.handleDelete && (
                <>
                  <Button
                    onClick={() => setDeleteWarning(true)}
                    color="secondary"
                  >
                    Delete
                  </Button>
                  <ConfirmationDialog
                    open={deleteWarning}
                    handleClose={() => setDeleteWarning(false)}
                    title={`Deleting ${props.initialValues.title}?`}
                    message={`This question will be removed from the script.`}
                    handleConfirm={props.handleDelete}
                  />
                </>
              )}
              <Button onClick={props.handleClose} color="default">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Confirm
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default QuestionEditDialog;
