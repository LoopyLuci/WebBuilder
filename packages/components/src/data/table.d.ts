import React from 'react';
export interface TableColumn<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}
export interface TableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    sortable?: boolean;
    paginated?: boolean;
    pageSize?: number;
    selectable?: boolean;
    selectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    emptyMessage?: string;
    className?: string;
}
export declare function Table<T>({ columns, data, keyExtractor, sortable, paginated, pageSize, selectable, selectedKeys, onSelectionChange, emptyMessage, className, }: TableProps<T>): React.JSX.Element;
export default Table;
//# sourceMappingURL=table.d.ts.map