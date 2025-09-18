import { ColumnMode, SortType, TableColumn } from '@swimlane/ngx-datatable';

export const DEFAULT_TABLE_SETTINGS = {
  columnMode: ColumnMode.force,
  headerHeight: 50,
  footerHeight: 50,
  rowHeight: 'auto',
  limit: 10,
  scrollbarH: true,
  selectionType: 'single',
  messages: {
    emptyMessage: 'No se encontraron registros',
    totalMessage: 'total',
    selectedMessage: 'seleccionado'
  },
  sorts: [{ prop: 'id', dir: 'desc' }]
};

// Helper function to create consistent columns
export function createTableColumns(
  columns: Array<{
    name: string;
    prop: string;
    flexGrow?: number;
    sortable?: boolean;
    cellClass?: string | ((data: any) => any);
    headerClass?: string;
    pipe?: any;
    cellTemplate?: any;
  }>
): Array<TableColumn> {
  return columns.map(col => ({
    name: col.name,
    prop: col.prop,
    flexGrow: col.flexGrow || 1,
    sortable: col.sortable !== false,
    cellClass: col.cellClass || '',
    headerClass: col.headerClass || '',
    pipe: col.pipe || undefined
  }));
}

// Helper to create action column
export function createActionColumn(options?: {
  width?: number;
  name?: string;
  template?: any;
}): TableColumn {
  return {
    name: options?.name || 'Acciones',
    sortable: false,
    cellTemplate: options?.template,
    maxWidth: options?.width || 100
  };
}
