// Material UI
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography
} from "@material-ui/core";
import api from "api";
import {
  Field,
  FieldProps,
  Form,
  Formik,
  FormikProps,
  FormikErrors
} from "formik";
import React from "react";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";
import { isPageValid } from "../../../../utils/questionTemplateUtil";
import QuestionTemplateSelect from "./QuestionTemplateSelect";
import useScriptSetup from "AuthenticatedApp/paperSetup/context/ScriptSetupContext";

export interface NewQuestionTemplateValues {
  title: string;
  score?: number;
  pageCovered?: string;
  parentQuestionTemplateId?: string;
}

interface SharedProps {
  open: boolean;
  handleClose: (e?: any) => void;
  initialValues?: NewQuestionTemplateValues;
  questionTemplateId?: number;
}

export interface QuestionEditDialogProps extends SharedProps {
  mode: "editLeaf" | "editTree";
  questionTemplateId: number;
  initialValues: NewQuestionTemplateValues;
}

export interface QuestionCreateDialogProps extends SharedProps {
  mode: "create";
}

type Props = QuestionEditDialogProps | QuestionCreateDialogProps;

const QuestionEditDialog: React.FC<Props> = props => {
  const {
    scriptTemplateSetupData,
    currentPageNo,
    pageCount,
    refresh
  } = useScriptSetup();
  const {
    open,
    mode,
    handleClose,
    initialValues = {
      title: "",
      score: 1,
      pageCovered: `${currentPageNo}`
    }
  } = props;
  const [deleteWarning, setDeleteWarning] = React.useState(false);
  const [isParent, setIsParent] = React.useState(false);
  const onSubmit = async (values: NewQuestionTemplateValues) => {
    try {
      if (mode === "create") {
        const postData = isParent
          ? {
              name: values.title,
              parentQuestionTemplateId: Number(values.parentQuestionTemplateId)
            }
          : {
              name: values.title,
              score: values.score,
              pageCovered: values.pageCovered,
              displayPage: currentPageNo,
              parentQuestionTemplateId: Number(values.parentQuestionTemplateId)
            };
        await api.questionTemplates.createQuestionTemplate(
          scriptTemplateSetupData.id,
          postData
        );
      } else {
        const postData =
          mode === "editLeaf"
            ? {
                name: values.title,
                score: values.score,
                pageCovered: values.pageCovered
              }
            : {
                name: values.title
              };
        await api.questionTemplates.editQuestionTemplate(
          (props as QuestionEditDialogProps).questionTemplateId,
          postData
        );
      }
      toast.success("Question successfully created");
      refresh();
      handleClose();
    } catch (error) {
      toast.error("An error occured while handling the questionTemplate");
      // TODO: Handle this better
    }
  };
  const handleDelete = async () => {
    try {
      await api.questionTemplates.discardQuestionTemplate(
        (props as QuestionEditDialogProps).questionTemplateId
      );
      toast.success(
        `${
          (props as QuestionEditDialogProps).initialValues.title
        } successfully deleted`
      );
      refresh();
      handleClose();
    } catch (error) {
      toast.error(
        `Failed to delete ${
          (props as QuestionEditDialogProps).initialValues.title
        }`
      );
    }
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          onSubmit(values);
          actions.setSubmitting(false);
          actions.resetForm();
          handleClose();
        }}
        validate={values => {
          const errors: FormikErrors<NewQuestionTemplateValues> = {};
          if (isParent) return errors;
          if (values.score! <= 0) errors.score = "Score should be positive";
          const pageError = isPageValid(
            values.pageCovered!,
            currentPageNo,
            pageCount
          );
          if (pageError) errors.pageCovered = pageError;
          return errors;
        }}
      >
        {(formikProps: FormikProps<NewQuestionTemplateValues>) => (
          <Form>
            <DialogTitle>
              {mode !== "create"
                ? `Editing ${initialValues.title}`
                : "Add Question"}
            </DialogTitle>
            <DialogContent>
              <Grid
                container
                justify="flex-start"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={mode !== "create" ? 12 : 6}>
                  <Field name="title" validate={value => !value && "Required"}>
                    {({
                      field,
                      meta
                    }: FieldProps<NewQuestionTemplateValues>) => (
                      <Box display="inline-flex" alignItems="center">
                        <Typography variant="subtitle1">Q</Typography>
                        <TextField
                          error={!!meta.error}
                          autoFocus
                          margin="dense"
                          label="Name"
                          helperText={meta.error || "e.g. 1a"}
                          required
                          {...field}
                        />
                      </Box>
                    )}
                  </Field>
                </Grid>
                {mode === "create" && (
                  <>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isParent}
                            onChange={() => setIsParent(!isParent)}
                          />
                        }
                        label="Is Parent Question?"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <Typography>Parent: </Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <QuestionTemplateSelect
                        selfId={
                          mode !== "create" ? props.questionTemplateId! : null
                        }
                        container={node => node.parentNode}
                      />
                    </Grid>
                  </>
                )}

                {((mode === "create" && !isParent) || mode === "editLeaf") && (
                  <>
                    <Grid item xs={6}>
                      <Field name="score">
                        {({
                          field,
                          meta
                        }: FieldProps<NewQuestionTemplateValues>) => (
                          <TextField
                            error={!!meta.error}
                            margin="dense"
                            label="Score"
                            helperText={meta.error}
                            type="number"
                            required
                            fullWidth
                            {...field}
                          />
                        )}
                      </Field>
                    </Grid>
                    <Grid item xs={6}>
                      <Field name="pageCovered">
                        {({
                          field,
                          meta
                        }: FieldProps<NewQuestionTemplateValues>) => (
                          <TextField
                            error={!!meta.error}
                            margin="dense"
                            label="Page Covered"
                            helperText={meta.error}
                            placeholder="1, 2, 4-5"
                            required
                            fullWidth
                            {...field}
                          />
                        )}
                      </Field>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {mode !== "create" && (
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
                    title={`Deleting ${initialValues.title}?`}
                    message={`The children of the question will also be removed from the script.`}
                    handleConfirm={() => {
                      handleDelete();
                      refresh();
                    }}
                  />
                </>
              )}
              <Button onClick={handleClose} color="default">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  formikProps.validateForm();
                  formikProps.submitForm();
                }}
                color="primary"
              >
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
