import React, { PureComponent } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Button from "@material-ui/core/Button";
import SnackbarContext from "./SnackbarContext";

interface Props {
  ButtonProps?: any;
  SnackbarProps?: any;
}

export default class SnackbarProvider extends PureComponent<Props> {
  state = {
    message: null,
    open: false,
    action: "",
    handleAction: () => {}
  };

  showMessage = (message: string, action: string, handleAction?: () => {}) => {
    this.setState({ open: true, message, action, handleAction });
  };

  handleActionClick = () => {
    this.handleClose();
    this.state.handleAction && this.state.handleAction();
  };

  handleClose = () => {
    this.setState({ open: false, handleAction: null });
  };

  render() {
    const { action, message, open } = this.state;

    const { ButtonProps = {}, children, SnackbarProps = {} } = this.props;

    return (
      <React.Fragment>
        <SnackbarContext.Provider
          value={{
            showMessage: this.showMessage
          }}
        >
          {children}
        </SnackbarContext.Provider>
        <Snackbar
          {...SnackbarProps}
          open={open}
          message={message || ""}
          action={
            action != null && (
              <Button
                color="secondary"
                size="small"
                {...ButtonProps}
                onClick={this.handleActionClick}
              >
                {action}
              </Button>
            )
          }
          onClose={this.handleClose}
        />
      </React.Fragment>
    );
  }
}
