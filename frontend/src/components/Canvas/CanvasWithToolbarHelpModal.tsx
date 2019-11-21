import React, { useState, ReactNode } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitleWithCloseButton from "../dialogs/DialogTitleWithCloseButton";
interface OwnProps {
  drawable: boolean;
  render: (toggleVisibility: () => void) => ReactNode;
}

type Props = OwnProps;

const HelpModal: React.FC<Props> = ({ drawable, render }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
    <>
      <Dialog open={isOpen} fullWidth onClose={toggleVisibility}>
        <DialogTitleWithCloseButton
          id="dialog-title-with-close-button"
          onClose={toggleVisibility}
        >
          {`Controls help`}
        </DialogTitleWithCloseButton>
        <DialogContent dividers>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mode</TableCell>
                <TableCell>Mouse</TableCell>
                <TableCell>Trackpad</TableCell>
                <TableCell>Touch</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  View
                </TableCell>
                <TableCell>
                  <p>Pan - click and drag</p>
                  <p>Zoom - Ctrl + mouse wheel</p>
                </TableCell>
                <TableCell>
                  <p>Pan - click and drag; slide two fingers around</p>
                  <p>Zoom - pinch with two fingers</p>
                </TableCell>
                <TableCell>
                  <p>Pan - slide one finger around</p>
                  <p>Zoom - pinch with two fingers</p>
                  <p>Pan and zoom - slide and pinch with two fingers</p>
                </TableCell>
              </TableRow>
              {drawable && (
                <TableRow>
                  <TableCell component="th" scope="row">
                    Pen/Eraser
                  </TableCell>
                  <TableCell>
                    <p>Draw/erase - click and drag</p>
                    <p>Zoom - Ctrl + mouse wheel</p>
                  </TableCell>
                  <TableCell>
                    <p>Draw/erase - click and drag</p>
                    <p>Pan - slide two fingers around</p>
                    <p>Zoom - pinch with two fingers</p>
                  </TableCell>
                  <TableCell>
                    <p>Draw/erase - slide one finger around</p>
                    <p>Pan and zoom - slide and pinch with two fingers</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
      {render(toggleVisibility)}
    </>
  );
};

export default HelpModal;
