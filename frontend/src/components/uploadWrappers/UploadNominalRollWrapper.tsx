import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import api from "../../api";
import { DropAreaBase } from "material-ui-file-dropzone";
import { ScriptTemplateData } from "backend/src/types/scriptTemplates";
import useSnackbar from "../../components/snackbar/useSnackbar";

interface OwnProps {
  clickable?: boolean;
}

type Props = RouteComponentProps & OwnProps;

const UploadNominalRollWrapper: React.FC<Props> = props => {
  const snackbar = useSnackbar();
  const {
    children,
    clickable = true
  } = props;

  return (
  
    <DropAreaBase
          accept={".csv"}
          clickable={clickable}
          single
          onSelectFiles={files => {
            Object.keys(files).forEach(key => {
              const file = files[key];
              const onSuccessfulResponse = () => {
                snackbar.showMessage(
                  `Nominal roll list has been uploaded successfully.`,
                  "Close"
                );
              };
              // TODO: api to create paperUsers here
            });
          }}
        >
          {children}
        </DropAreaBase>
  );
};

export default withRouter(UploadNominalRollWrapper);
