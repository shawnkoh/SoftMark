export interface TableColumn {
  // The display name of the column.
  name: string;
  // The column key of the column, used for sorting.
  key: string;
  // Whether the column supports sorting.
  isSortable?: boolean;
}
