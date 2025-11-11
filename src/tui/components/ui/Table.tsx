import React from 'react';
import { Box, Text } from 'ink';

type ScalarDict = Record<string, string | number | boolean | null | undefined>;

export interface TableProps<T extends ScalarDict> {
  data: T[];
  columns?: (keyof T)[];
  padding?: number;
  hiddenHeaders?: (keyof T)[];
  header?: React.ComponentType<React.PropsWithChildren<object>>;
  cell?: React.ComponentType<React.PropsWithChildren<{ column: string; row: T }>>;
  skeleton?: React.ComponentType<React.PropsWithChildren<object>>;
}

function Table<T extends ScalarDict>({
  data,
  columns,
  padding = 1,
  hiddenHeaders = [],
  header: Header = ({ children }) => <Text bold>{children}</Text>,
  cell: Cell = ({ children }) => <Text>{children}</Text>,
  skeleton: Skeleton = ({ children }) => <Text>{children}</Text>,
}: TableProps<T>) {
  // Get columns from data if not provided
  const tableColumns = columns ?? (data.length > 0 && data[0] ? Object.keys(data[0]) : []);

  // Calculate column widths based on content
  const getColumnWidth = (column: keyof T): number => {
    const headerLength = String(column).length;
    const maxContentLength = data.reduce((max, row) => {
      const cellContent = String(row[column] ?? '');
      return Math.max(max, cellContent.length);
    }, 0);

    return Math.max(headerLength, maxContentLength) + padding;
  };

  const columnWidths = tableColumns.reduce((widths, column) => {
    widths[column] = getColumnWidth(column);
    return widths;
  }, {} as Record<keyof T, number>);

  // Format cell content
  const formatCell = (value: T[keyof T]): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      {/* Header Row */}
      <Box flexDirection="row">
        {tableColumns.map((column) => (
          <Box key={String(column)} width={columnWidths[column]} paddingRight={padding}>
            <Header>
              <Skeleton>{hiddenHeaders.includes(column) ? "" : String(column)}</Skeleton>
            </Header>
          </Box>
        ))}
      </Box>

      {/* Data Rows */}
      {data.map((row, index) => (
        <Box key={index} flexDirection="row" marginTop={1}>
          {tableColumns.map((column) => (
            <Box key={String(column)} width={columnWidths[column]} paddingRight={padding}>
              <Cell column={String(column)} row={row}>
                {formatCell(row[column])}
              </Cell>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default Table;