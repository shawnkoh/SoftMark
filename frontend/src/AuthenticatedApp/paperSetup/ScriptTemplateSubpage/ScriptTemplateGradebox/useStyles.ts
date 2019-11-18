import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: {
      position: "absolute",
      cursor: "move"
    }
  })
);

export default useStyles;
