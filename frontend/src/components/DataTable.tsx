import { ReactNode } from "react";

interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({ columns, rows, emptyMessage = "Nothing here yet.", rowKey }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p style={{ color: "var(--color-muted)", fontSize: "0.87rem" }}>{emptyMessage}</p>;
  }

  return (
    <div className="data-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.header}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}