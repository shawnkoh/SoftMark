import React, { Component, FocusEventHandler, RefObject } from "react";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import Paper from "@material-ui/core/Paper";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import { WithStyles } from "@material-ui/core/styles/withStyles";
import {
  createStyles,
  MenuItem,
  Typography,
  withStyles
} from "@material-ui/core";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { AxiosResponse } from "axios";

const styles = (theme: any) =>
  createStyles({
    root: {
      height: 48,
      display: "flex",
      justifyContent: "space-between",
      borderRadius: 24
    },
    iconButton: {
      transform: "scale(1, 1)",
      transition: "transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)"
    },
    iconButtonHidden: {
      transform: "scale(0, 0)",
      "& > $icon": {
        opacity: 0
      },
      visibility: "hidden"
    },
    searchIconButton: {
      marginRight: -48
    },
    icon: {
      opacity: 0.54,
      transition: "opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)"
    },
    input: {
      width: "100%",
      outline: "none",
      border: "none"
    },
    searchContainer: {
      margin: "auto 16px",
      width: "calc(100% - 48px - 32px)" // 48px button + 32px margin
    },
    iconButtonSelected: {
      borderColor: "#007bff !important",
      color: "white !important"
    },
    suggestionContainer: {
      position: "relative"
    },
    suggestionsContainerOpen: {
      position: "absolute",
      zIndex: 1,
      marginTop: theme.spacing(1),
      left: 30,
      width: "calc(100% - 48px - 32px)" // 48px button + 32px margin
    },
    suggestion: {
      display: "block"
    },
    suggestionsList: {
      margin: 0,
      padding: 0,
      listStyleType: "none"
    }
  });

interface SearchBarProps extends WithStyles<typeof styles> {
  /** Whether to clear search on escape */
  cancelOnEscape?: boolean;
  /** Override or extend the styles applied to the component. */
  classes: any;
  /** Custom top-level class */
  className: string;
  /** Fired when the text value changes. */
  onChange?: (v: string) => void;
  /** Fired when the field is focused. */
  onFocus?: FocusEventHandler;
  /** Fired when the field is out of focus. */
  onBlur?: FocusEventHandler;
  /** Listener for keyboard events. */
  onKeyUp?: FocusEventHandler;
  /** Fired when the search icon is clicked or Enter is pressed. */
  onRequestSearch?: (value: string) => void;
  /** Sets placeholder text for the embedded text field. */
  placeholder?: string;
  /** Override the inline-styles of the root element. */
  style?: Record<string, any>;
  /** The value of the text field. */
  value: string;
  /** A function that is called whenever SearchBar wants to search for auto complete suggestions */
  getSuggestions?: (value: string) => Promise<AxiosResponse<any[]>>;
  /** This function will be called when a suggestion is selected */
  onSuggestionSelected?: (
    event: React.FormEvent<any>,
    data: Autosuggest.SuggestionSelectedEventData<any>
  ) => void;
  disabled?: boolean;
}
type SearchBarState = {
  focus: boolean;
  value: string;
  prevValue: string;
  active: boolean;
  suggestions: any[];
};

class SearchBar extends Component<SearchBarProps, SearchBarState> {
  static defaultProps = {
    className: "",
    placeholder: "Search",
    value: ""
  };
  searchInput: RefObject<HTMLInputElement>;

  constructor(props: SearchBarProps) {
    super(props);
    this.searchInput = React.createRef();
    this.state = {
      focus: false,
      value: this.props.value,
      prevValue: "",
      active: false,
      suggestions: []
    };
  }

  handleFocus = (e: any): void => {
    this.setState({ focus: true });
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  };

  handleBlur = (e: any) => {
    this.setState({ focus: false });
    if (this.state.value.trim().length === 0) {
      this.setState({ value: "" });
    }
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  };

  handleInput = (value: string) => {
    this.setState({ value: value });

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  handleCancel = () => {
    this.setState({ value: "" });

    if (this.props.onChange) {
      this.handleInput("");
    }
  };

  handleKeyUp = (e: any) => {
    if (e.key === "Enter") {
      this.handleRequestSearch();
    } else if (this.props.cancelOnEscape && e.key === "Escape") {
      this.handleCancel();
    }
    if (this.props.onKeyUp) {
      this.props.onKeyUp(e);
    }
  };

  handleRequestSearch = () => {
    if (this.props.onRequestSearch) {
      this.props.onRequestSearch(this.state.value);
    }
  };

  focusOnSearchBar = () => {
    this.searchInput.current && this.searchInput.current.focus();
  };

  handleSuggestionsFetchRequested = ({ value }: any) => {
    if (this.props.getSuggestions) {
      this.props.getSuggestions(value).then(response => {
        this.setState({ suggestions: response.data });
      });
    }
  };

  handleSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] });
  };

  getSuggestionValue(suggestion) {
    return `suggestion value stub`;
  }

  handleChange = (
    event: React.ChangeEvent<{}>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    if (this.props.onChange) {
      this.props.onChange(newValue);
    }
    this.setState({ value: newValue });
  };

  renderInputComponent = (inputProps: any) => {
    const { className } = inputProps;
    return (
      <Input
        {...inputProps}
        fullWidth
        className={className}
        disableUnderline
        inputRef={this.searchInput}
      />
    );
  };

  render() {
    const { value } = this.state;
    const {
      cancelOnEscape,
      className,
      classes,
      onRequestSearch,
      style,
      getSuggestions,
      onSuggestionSelected,
      ...inputProps
    } = this.props;

    const autosuggestProps = {
      renderInputComponent: this.renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue: this.getSuggestionValue,
      onSuggestionSelected: onSuggestionSelected,
      renderSuggestion
    };

    return (
      <div className={className}>
        <Paper
          className={`${classes.root} search-bar`}
          style={style}
          elevation={2}
        >
          <div className={classes.searchContainer}>
            <Autosuggest
              {...autosuggestProps}
              inputProps={{
                ...inputProps,
                onBlur: this.handleBlur,
                value: value,
                onChange: this.handleChange,
                onKeyUp: this.handleKeyUp,
                onFocus: this.handleFocus,
                className: classes.input
              }}
              theme={{
                container: classes.container,
                suggestionsContainerOpen: classes.suggestionsContainerOpen,
                suggestionsList: classes.suggestionsList,
                suggestion: classes.suggestion
              }}
              renderSuggestionsContainer={options => (
                <Paper {...options.containerProps}>{options.children}</Paper>
              )}
            />
          </div>
          <IconButton
            onClick={this.focusOnSearchBar}
            classes={{
              root: `${classes.iconButton} ${classes.searchIconButton}
              ${value !== "" ? classes.iconButtonHidden : ""}`
            }}
            disableFocusRipple
          >
            {React.cloneElement(<SearchIcon />, {
              classes: { root: classes.icon }
            })}
          </IconButton>
          <IconButton
            onMouseDown={this.handleCancel}
            classes={{
              root: `${classes.iconButton}
              ${value === "" ? classes.iconButtonHidden : ""}`
            }}
            disableFocusRipple
          >
            {React.cloneElement(<ClearIcon />, {
              classes: { root: classes.icon }
            })}
          </IconButton>
        </Paper>
      </div>
    );
  }
}

function renderSuggestion(
  suggestion,
  { query, isHighlighted }: Autosuggest.RenderSuggestionParams
) {
  const text = `suggestion stub`;
  const matches = match(text, query);
  const parts = parse(text, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <Typography variant="inherit" noWrap>
        {parts.map(part => (
          <span
            key={part.text}
            style={{ fontWeight: part.highlight ? 700 : 400 }}
          >
            {part.text}
          </span>
        ))}
      </Typography>
    </MenuItem>
  );
}

export default withStyles(styles)(SearchBar);
