import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { RouteComponentProps, withRouter } from "react-router";
import * as Yup from "yup";
import api from "../../../../api";
import { getCurrentUser, isLoggedIn } from "../../selectors";
import { setCurrentUser, logOut } from "../../actions";
import { Button, Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import SimpleForm, {
  FormMetadataType
} from "../../../../components/forms/SimpleForm";
import { UserPatchData } from "backend/src/types/users";

type Props = RouteComponentProps;

const PortfolioButtonAndModal: React.FC<Props> = props => {
  const dispatch = useDispatch();
  const loggedIn = useSelector(isLoggedIn);
  const currentUser = useSelector(getCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toggleRefreshFlag = () => setRefreshFlag(!refreshFlag);

  useEffect(() => {
    api.users.getOwnUser().then(res => {
      dispatch(setCurrentUser(res.data.user));
    });
    if (!loggedIn) {
      props.history.push("/login");
    }
  }, [refreshFlag]);

  useEffect(() => {
    if (!loggedIn) {
    }
  }, [loggedIn]);

  if (!currentUser) {
    return <div />;
  }

  const values: UserPatchData = {
    name: currentUser.name,
    email: currentUser.email
  };

  const formMetadata: FormMetadataType<UserPatchData> = {
    name: { label: "Name", required: true, options: null, xs: 10, sm: 10 },
    email: { label: "Email", required: true, options: null, xs: 10, sm: 10 }
  };
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required")
  });

  return (
    <>
      <Dialog open={isOpen} fullWidth>
        <DialogTitle>Account</DialogTitle>
        <DialogContent>
          <SimpleForm
            initialValues={values}
            formMetadata={formMetadata}
            validationSchema={validationSchema}
            onCancel={toggleVisibility}
            onSubmit={(newValues: UserPatchData) =>
              api.users.patchOwnUser(newValues).then(resp => {
                toggleRefreshFlag();
                toggleVisibility();
                return false;
              })
            }
          />
          <Button
            color="primary"
            onClick={async () => {
              dispatch(logOut());
              props.history.push("/login");
            }}
          >
            Log out
          </Button>
        </DialogContent>
      </Dialog>
      <Button color="secondary" onClick={toggleVisibility}>
        <Person />
      </Button>
    </>
  );
};

export default withRouter(PortfolioButtonAndModal);
