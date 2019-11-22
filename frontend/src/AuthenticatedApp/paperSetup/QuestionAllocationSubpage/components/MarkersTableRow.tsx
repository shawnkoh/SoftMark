import { IconButton, TableCell, TableRow, Tooltip } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import red from "@material-ui/core/colors/red";
import { makeStyles } from "@material-ui/core/styles";
import Delete from "@material-ui/icons/Delete";
import {
  AllocationListData,
  AllocationPostData
} from "backend/src/types/allocations";
import { QuestionTemplateData } from "backend/src/types/questionTemplates";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { sumArray } from "utils/arrays";
import api from "../../../../api";
import ReversedChip from "../../../../components/ReversedChip";
import { getUser } from "../../../../store/auth/selectors";
import { PaperUserListData } from "../../../../types/paperUsers";
import DeleteMarkerModal from "./DeleteMarkerModal";

const useStyles = makeStyles(theme => ({
  red: {
    color: red[500]
  },
  chip: {
    marginRight: theme.spacing(2)
  }
}));

interface OwnProps {
  index: number;
  columns: number;
  marker: PaperUserListData;
  questionTemplates: QuestionTemplateData[];
  refreshMarkers: () => void;
}

type Props = OwnProps;

const MarkersTableRow: React.FC<Props> = props => {
  const classes = useStyles();
  const currentUser = useSelector(getUser);
  const { refreshMarkers, index, columns, questionTemplates, marker } = props;
  const { user } = marker;
  const { name, email } = user;

  const [allocations, setAllocations] = useState<AllocationListData[]>([]);

  const getAllocations = () => {
    api.allocations
      .getAllocationsOfMarker(marker.id)
      .then(res => setAllocations(res.data.allocations));
  };

  const deleteAllocation = (allocationId: number) => {
    api.allocations
      .deleteAllocation(allocationId)
      .then(() => {
        getAllocations();
        toast.success("Deallication of question was succesfuk.");
      })
      .catch(() => toast.error("Deallocation of question could not be made."));
  };

  const postAllocation = (questionTemplate: QuestionTemplateData) => {
    const allocationPostData: AllocationPostData = {
      paperUserId: marker.id
    };
    api.allocations
      .createAllocation(questionTemplate.id, allocationPostData)
      .then(res => {
        toast.success(
          `Question ${questionTemplate.name} was successfully allocated to ${name}`
        );
        getAllocations();
      })
      .catch(() =>
        toast.error(
          `Question ${questionTemplate.name} could not be allocated to ${name}.`
        )
      );
  };

  useEffect(getAllocations, []);

  const allocatedQuestionTemplateIdToAllocationIdMap = new Map<
    number,
    number
  >();
  for (let i = 0; i < allocations.length; i++) {
    const allocation = allocations[i];
    allocatedQuestionTemplateIdToAllocationIdMap.set(
      allocation.questionTemplateId,
      allocation.id
    );
  }

  const questionTemplateScores = questionTemplates.map(questionTemplate =>
    allocatedQuestionTemplateIdToAllocationIdMap.get(questionTemplate.id) &&
    questionTemplate.score
      ? questionTemplate.score
      : 0
  );
  const totalScore = sumArray(questionTemplateScores);

  return (
    <>
      <TableRow>
        <TableCell>{index}</TableCell>
        <TableCell>{name ? name : "-"}</TableCell>
        <TableCell>{email}</TableCell>
        <TableCell>
          {currentUser && currentUser.id !== user.id && (
            <DeleteMarkerModal
              marker={marker}
              refreshMarkers={refreshMarkers}
              render={toggleModal => (
                <Tooltip title={"Delete marker"}>
                  <IconButton className={classes.red} onClick={toggleModal}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}
            />
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell />
        <TableCell>Total marks: {totalScore}</TableCell>
        <TableCell colSpan={columns - 2}>
          {questionTemplates.map(questionTemplate => {
            const allocationId = allocatedQuestionTemplateIdToAllocationIdMap.get(
              questionTemplate.id
            );
            return (
              <ReversedChip
                avatar={<Avatar>{questionTemplate.score}</Avatar>}
                label={"Q" + questionTemplate.name}
                color={allocationId ? "primary" : "default"}
                className={classes.chip}
                onClick={() => {
                  allocationId
                    ? deleteAllocation(allocationId)
                    : postAllocation(questionTemplate);
                }}
              />
            );
          })}
        </TableCell>
      </TableRow>
    </>
  );
};

export default MarkersTableRow;
