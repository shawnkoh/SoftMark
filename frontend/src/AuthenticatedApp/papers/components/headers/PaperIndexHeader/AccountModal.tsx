import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText
} from "@material-ui/core";
import { UserPatchData } from "backend/src/types/users";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import * as Yup from "yup";
import { patchOwnUser } from "../../../../../api/users";
import CustomDialogTitle from "../../../../../components/dialogs/DialogTitleWithCloseButton";
import SimpleForm, {
  FormMetadataType
} from "../../../../../components/forms/SimpleForm";
import { logOut } from "../../../../../store/auth/actions";
import { getUser } from "../../../../../store/auth/selectors";

interface Props {
  render: any;
}

const AccountModal: React.FC<Props> = props => {
  const history = useHistory();
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  if (!user) {
    return <div />;
  }

  const values: UserPatchData = {
    email: user.email,
    name: user.name
  };

  const formMetadata: FormMetadataType<UserPatchData> = {
    name: { label: "Name", required: true, options: null, xs: 12, sm: 12 },
    email: { label: "Email", required: true, options: null, xs: 12, sm: 12 }
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required")
  });

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={toggleVisibility}
        aria-labelledby="customized-dialog-title"
      >
        <CustomDialogTitle
          id="customized-dialog-title"
          onClose={toggleVisibility}
        >
          Account
        </CustomDialogTitle>
        <DialogContent dividers>
          <DialogContentText>Edit account details</DialogContentText>
          <SimpleForm
            initialValues={values}
            formMetadata={formMetadata}
            validationSchema={validationSchema}
            onCancel={toggleVisibility}
            onSubmit={(newValues: UserPatchData) =>
              patchOwnUser(newValues).then(resp => {
                toggleRefreshFlag();
                toggleVisibility();
                return false;
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={async () => {
              dispatch(logOut());
              history.push("/login");
            }}
          >
            Log out
          </Button>
        </DialogActions>
      </Dialog>
      {props.render(toggleVisibility)}
    </>
  );
};

export default AccountModal;
