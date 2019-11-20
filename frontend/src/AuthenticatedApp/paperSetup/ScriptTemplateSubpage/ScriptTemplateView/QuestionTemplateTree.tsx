import React from "react";
import { QuestionTemplateTreeData } from "backend/src/types/questionTemplates";
import { useTheme } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  ListItemSecondaryAction,
  IconButton,
  ListItemIcon
} from "@material-ui/core";
import QuestionTemplateDialog from "./QuestionTemplateDialog";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import EditIcon from "@material-ui/icons/Edit";

interface TreeProps {
  questionTemplateTree: QuestionTemplateTreeData;
  depth: number;
  leafOnClick: (displayPageNo: number) => void;
}

const QuestionTemplateTree: React.FC<TreeProps> = props => {
  const { questionTemplateTree, depth, leafOnClick } = props;
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      {!questionTemplateTree.displayPage && (
        <QuestionTemplateDialog
          mode="editTree"
          questionTemplateId={questionTemplateTree.id}
          open={editOpen}
          handleClose={() => setEditOpen(false)}
          initialValues={{
            title: questionTemplateTree.name
          }}
        />
      )}

      {questionTemplateTree.childQuestionTemplates.length === 0 ? (
        <List component="div" disablePadding>
          <ListItem
            button
            style={{
              paddingLeft: theme.spacing(depth + 2)
            }}
            onClick={() =>
              questionTemplateTree.displayPage &&
              leafOnClick(questionTemplateTree.displayPage)
            }
          >
            <ListItemText
              primary={"Q" + questionTemplateTree.name}
              secondary={
                questionTemplateTree.score !== null &&
                `Score: ${questionTemplateTree.score}`
              }
            />
            {!questionTemplateTree.displayPage && (
              <ListItemSecondaryAction>
                <IconButton onClick={() => setEditOpen(true)} edge="end">
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        </List>
      ) : (
        <List component="div" disablePadding>
          <ListItem
            button
            onClick={handleClick}
            style={{
              paddingLeft: theme.spacing(depth + 2)
            }}
          >
            <ListItemText primary={"Q" + questionTemplateTree.name} />
            <ListItemIcon>
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemIcon>
            <ListItemSecondaryAction>
              <IconButton onClick={() => setEditOpen(true)} edge="end">
                <EditIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {questionTemplateTree.childQuestionTemplates.map(
              childQuestionTemplate => (
                <QuestionTemplateTree
                  key={childQuestionTemplate.id}
                  questionTemplateTree={childQuestionTemplate}
                  depth={depth + 1}
                  leafOnClick={leafOnClick}
                />
              )
            )}
          </Collapse>
        </List>
      )}
    </>
  );
};

export default QuestionTemplateTree;
