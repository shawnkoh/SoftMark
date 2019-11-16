import { Button, Grid, Typography } from "@material-ui/core";
import { InviteData } from "backend/src/types/paperUsers";
import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";

interface Props {
  inviteData: InviteData;
  replyInvite: (accepted: boolean, name: string | null) => Promise<void>;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Required")
});

const AcceptingForm: React.FC<Props> = ({ inviteData, replyInvite }) => {
  const { paperName, userName } = inviteData;

  return (
    <Formik
      validateOnBlur={false}
      initialValues={{
        name: paperName
      }}
      onSubmit={async (values, { setSubmitting }) => {
        const { name } = values;
        await replyInvite(true, name);
        setSubmitting(false);
      }}
      validationSchema={validationSchema}
    >
      {props => (
        <Form>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="stretch"
            spacing={2}
          >
            <Grid item>
              <Typography>What is your name?</Typography>
            </Grid>

            <Grid item>
              <Button>Go</Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AcceptingForm;
