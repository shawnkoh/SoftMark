import React from "react";
import * as Yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PaperPostData, PaperData } from "backend/src/types/papers";
import SimpleForm, {
  FormMetadataType
} from "../../../../components/forms/SimpleForm";
import FadedDivider from "../dividers/FadedDivider";
import { editPaper } from "../../../../api/papers";

const useStyles = makeStyles(() => ({
  dialogTitle: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 30
  }
}));

interface OwnProps {
  paper: PaperData;
  visible: boolean;
  toggleVisibility: () => void;
  toggleRefresh: () => void;
}

type Props = OwnProps;

const EditPaperModal: React.FC<Props> = ({
  paper,
  visible,
  toggleVisibility,
  toggleRefresh
}) => {
  const classes = useStyles();

  const values: PaperPostData = {
    name: paper.name
  };

  const formMetadata: FormMetadataType<PaperPostData> = {
    name: { label: "Name", required: true, options: null, xs: 12, sm: 12 }
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required")
  });

  return (
    <Dialog open={visible} onBackdropClick={toggleVisibility} fullWidth>
      <DialogContent>
        <Typography variant="h4" className={classes.dialogTitle}>
          Edit paper
        </Typography>
        <FadedDivider />
        <SimpleForm
          initialValues={values}
          formMetadata={formMetadata}
          validationSchema={validationSchema}
          onCancel={toggleVisibility}
          onSubmit={(newValues: PaperPostData) =>
            editPaper(paper.id, newValues).then(resp => {
              toggleRefresh();
              toggleVisibility();
              return false;
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditPaperModal;
