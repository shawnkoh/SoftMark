import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import * as Yup from "yup";

import { UserPatchData } from "backend/src/types/users";
import { setUser, logOut } from "../actions";
import { getUser } from "../selectors";
import { getOwnUser, patchOwnUser } from "../../../api/users";

import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle
} from "@material-ui/core";
import CustomDialogTitle from "../../../components/dialogs/DialogTitleWithCloseButton";
import SimpleForm, {
  FormMetadataType
} from "../../../components/forms/SimpleForm";

interface Props extends RouteComponentProps {
  render: any;
}

const AccountModal: React.FC<Props> = props => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  // useEffect(() => {
  //   getOwnUser().then(user => {
  //     console.log("account modal set user");
  //     dispatch(setUser(user));
  //   });
  //   if (!user) {
  //     props.history.push("/login");
  //   }
  // }, [refreshFlag]);

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
              props.history.push("/login");
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

export default withRouter(AccountModal);
