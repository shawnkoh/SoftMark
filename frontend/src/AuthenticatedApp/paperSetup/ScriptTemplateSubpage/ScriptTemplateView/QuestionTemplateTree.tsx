import React from "react";
import { QuestionTemplateTreeData } from "backend/src/types/questionTemplates";
import { useTheme } from "@material-ui/core/styles";
import { List, ListItem, ListItemText, Collapse } from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

interface TreeProps {
  questionTemplateTree: QuestionTemplateTreeData;
  depth: number;
  leafOnClick: (displayPageNo: number) => void;
}

const QuestionTemplateTree: React.FC<TreeProps> = props => {
  const { questionTemplateTree, depth, leafOnClick } = props;
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const handleClick = () => {
    setOpen(!open);
  };

  return questionTemplateTree.childQuestionTemplates.length === 0 ? (
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
          primary={questionTemplateTree.name}
          secondary={
            questionTemplateTree.score !== null &&
            `Score: ${questionTemplateTree.score}`
          }
        />
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
        <ListItemText primary={questionTemplateTree.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
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
  );
};

export default QuestionTemplateTree;
