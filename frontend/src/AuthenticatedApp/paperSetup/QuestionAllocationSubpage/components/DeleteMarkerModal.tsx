import React, { useState } from "react";
import { toast } from "react-toastify";
import { discardPaperUser } from "../../../../api/paperUsers";
import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";
import { PaperUserListData } from "../../../../types/paperUsers";

interface OwnProps {
  marker: PaperUserListData;
  render: any;
  refreshMarkers: () => void;
}

type Props = OwnProps;

const DeleteMarkerModal: React.FC<Props> = props => {
  const { refreshMarkers, render, marker } = props;
  const { name, email } = marker.user;

  const [isOpen, setIsOpen] = useState(false);
  const toggleVisibility = () => setIsOpen(!isOpen);

  const userAsString = `${name} with email "${email}"`;

  return (
    <>
      <ConfirmationDialog
        title={`Delete marker ${userAsString}.`}
        message={`This action is irreversible. Do you still want to delete?`}
        open={isOpen}
        handleClose={toggleVisibility}
        handleConfirm={async () => {
          discardPaperUser(marker.id)
            .then(() => {
              if (refreshMarkers) {
                refreshMarkers();
              }
            })
            .catch(errors => {
              toast.error(
                `An error occured while deleting Marker ${userAsString}. Try refreshing the page.`
              );
            });
        }}
      />
      {render(toggleVisibility)}
    </>
  );
};

export default DeleteMarkerModal;
