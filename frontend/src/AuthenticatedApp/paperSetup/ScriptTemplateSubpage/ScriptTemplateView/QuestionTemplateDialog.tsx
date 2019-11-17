// Material UI
import {
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
  score: number;
  pageCovered: string;
  parentQuestionTemplateId?: string;
}

interface SharedProps {
  open: boolean;
  handleClose: (e?: any) => void;
  initialValues?: NewQuestionTemplateValues;
}

export interface QuestionEditDialogProps extends SharedProps {
  mode: "edit";
  questionTemplateId: number;
  initialValues: NewQuestionTemplateValues;
  isParent: boolean;
}

export interface QuestionCreateDialogProps extends SharedProps {
  mode: "create";
}

type Props = QuestionEditDialogProps | QuestionCreateDialogProps;

const QuestionEditDialog: React.FC<Props> = props => {
  const {
    open,
    mode,
    handleClose,
    initialValues = {
      title: "",
      score: 0,
      pageCovered: ""
    }
  } = props;
  const {
    scriptTemplateSetupData,
    currentPageNo,
    pageCount,
    refresh
  } = useScriptSetup();
  const [deleteWarning, setDeleteWarning] = React.useState(false);
  const [isParent, setIsParent] = React.useState(
    mode === "edit" && (props as QuestionEditDialogProps).isParent
  );
  const onSubmit = async (values: NewQuestionTemplateValues) => {
    try {
      if (isParent) {
        await api.questionTemplates.createQuestionTemplate(
          scriptTemplateSetupData.id,
          {
            name: values.title,
            parentQuestionTemplateId: Number(values.parentQuestionTemplateId)
          }
        );
      } else if (mode === "create") {
        await api.questionTemplates.createQuestionTemplate(
          scriptTemplateSetupData.id,
          {
            name: values.title,
            score: values.score,
            pageCovered: values.pageCovered,
            displayPage: currentPageNo,
            parentQuestionTemplateId: Number(values.parentQuestionTemplateId)
          }
        );
      } else {
        await api.questionTemplates.editQuestionTemplate(
          (props as QuestionEditDialogProps).questionTemplateId,
          {
            name: values.title,
            score: values.score,
            pageCovered: values.pageCovered,
            parentQuestionTemplateId: Number(values.parentQuestionTemplateId)
          }
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
          if (values.score < 0) errors.score = "Score should be non-negative";
          errors.pageCovered = isPageValid(
            values.pageCovered,
            currentPageNo,
            pageCount
          );
        }}
      >
        {(formikProps: FormikProps<NewQuestionTemplateValues>) => (
          <Form>
            <DialogTitle>
              {mode === "edit"
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
                <Grid item xs={6}>
                  <Field name="title" validate={value => !value && "Required"}>
                    {({
                      field,
                      meta
                    }: FieldProps<NewQuestionTemplateValues>) => (
                      <TextField
                        error={!!meta.error}
                        autoFocus
                        margin="dense"
                        label="Title"
                        helperText={meta.error || "e.g. Q1a"}
                        required={mode === "create"}
                        fullWidth
                        {...field}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isParent}
                        onChange={() => setIsParent(!isParent)}
                      />
                    }
                    label="Is Question Group?"
                  />
                </Grid>

                <Grid item xs={3}>
                  <Typography>Parent Question:</Typography>
                </Grid>
                <Grid item xs={9}>
                  <QuestionTemplateSelect container={node => node.parentNode} />
                </Grid>
                {!isParent && (
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
                            required={mode === "create" && !isParent}
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
                            required={mode === "create" && !isParent}
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
              {mode === "edit" && (
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
                    message={`This question will be removed from the script.`}
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
                  if (isParent) {
                    formikProps.setValues({
                      title: formikProps.values.title,
                      parentQuestionTemplateId:
                        formikProps.values.parentQuestionTemplateId,
                      score: 1,
                      pageCovered: "1"
                    });
                  }
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
