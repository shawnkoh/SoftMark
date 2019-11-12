// Material UI
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField
} from "@material-ui/core";
import api from "api";
import { AxiosResponse } from "axios";
import { QuestionTemplateData } from "backend/src/types/questionTemplates";
import { Field, FieldProps, Form, Formik, FormikProps } from "formik";
import React from "react";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../components/dialogs/ConfirmationDialog";
import { isPageValid } from "../../../utils/questionTemplateUtil";

export interface NewQuestionTemplateValues {
  title: string;
  score: number;
  pageCovered: string;
}

interface SharedProps {
  scriptTemplateId: number;
  open: boolean;
  handleClose: (e?: any) => void;
  currentPageNo: number;
  pageCount: number;
  initialValues?: NewQuestionTemplateValues;
  onSuccess: (qTemplate: QuestionTemplateData) => void;
}

export interface QuestionEditDialogProps extends SharedProps {
  mode: "edit";
  questionTemplateId: number;
  initialValues: NewQuestionTemplateValues;
  onDeleteSuccess?: () => void;
}

export interface QuestionCreateDialogProps extends SharedProps {
  mode: "create";
}

type Props = QuestionEditDialogProps | QuestionCreateDialogProps;

const QuestionEditDialog: React.FC<Props> = props => {
  const {
    scriptTemplateId,
    open,
    mode,
    handleClose,
    currentPageNo,
    pageCount,
    initialValues = { title: "", score: 0, pageCovered: "" },
    onSuccess
  } = props;
  const [deleteWarning, setDeleteWarning] = React.useState(false);

  const onSubmit = async (values: NewQuestionTemplateValues) => {
    try {
      let response: AxiosResponse<{ questionTemplate: QuestionTemplateData }>;
      if (mode == "create") {
        response = await api.questionTemplates.createQuestionTemplate(
          scriptTemplateId,
          {
            name: values.title,
            score: values.score,
            pageCovered: values.pageCovered
          }
        );
      } else {
        response = await api.questionTemplates.editQuestionTemplate(
          (props as QuestionEditDialogProps).questionTemplateId,
          {
            name: values.title,
            score: values.score
          }
        );
      }
      onSuccess(response.data.questionTemplate);
    } catch (error) {
      toast.error("An error occured while creating the questionTemplate");
      // TODO: Handle this better
    }
  };
  const handleDelete = () =>
    api.questionTemplates.discardQuestionTemplate(
      (props as QuestionEditDialogProps).questionTemplateId
    );

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
      >
        {(formikProps: FormikProps<NewQuestionTemplateValues>) => (
          <Form>
            <DialogTitle>
              {mode == "edit"
                ? `Editing ${initialValues.title}`
                : "Add Question"}
            </DialogTitle>
            <DialogContent>
              <Grid container justify="flex-start" spacing={2}>
                <Grid item xs>
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
                        required={mode == "create"}
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
                        required={mode == "create"}
                        {...field}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid container item>
                  <Field
                    name="pageCovered"
                    validate={value =>
                      isPageValid(value, currentPageNo, pageCount)
                    }
                  >
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
                        required={mode == "create"}
                        fullWidth
                        {...field}
                      />
                    )}
                  </Field>
                </Grid>
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
                    handleConfirm={() =>
                      handleDelete().then(
                        resp =>
                          (props as QuestionEditDialogProps).onDeleteSuccess &&
                          (props as QuestionEditDialogProps).onDeleteSuccess!()
                      )
                    }
                  />
                </>
              )}
              <Button onClick={handleClose} color="default">
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
