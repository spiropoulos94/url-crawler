import React from "react";
import { URLTableRow } from "./URLTableRow";
import { CheckboxCell, TableHeader, Container } from "../../ui";
import type { URL } from "../../../types";

export interface URLTableDesktopProps {
  urls: URL[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onSelectAll: (urls: URL[]) => void;
  onClearSelection: () => void;
  onNavigate: (id: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (key: string) => void;
  isAllSelected: boolean;
  className?: string;
}

export const URLTableDesktop: React.FC<URLTableDesktopProps> = React.memo(({
  urls,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onNavigate,
  sortBy,
  sortOrder,
  onSort,
  isAllSelected,
  className = "",
}) => {
  const handleSelectAllChange = React.useCallback((checked: boolean) => {
    if (checked) {
      onSelectAll(urls);
    } else {
      onClearSelection();
    }
  }, [onSelectAll, onClearSelection, urls]);

  return (
    <Container className={`hidden lg:block overflow-x-auto ${className}`}>
      <table 
        className="min-w-full divide-y divide-gray-200"
        role="table"
        aria-label="Website URLs data table"
        aria-rowcount={urls.length + 1}
        aria-colcount={8}
      >
        <thead 
          className="bg-gradient-to-r from-gray-50 to-gray-100"
          role="rowgroup"
        >
          <tr role="row">
            <CheckboxCell
              checked={isAllSelected}
              onChange={handleSelectAllChange}
              isSelectAll={true}
            />

            <TableHeader
              sortable
              sortKey="url"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              URL
            </TableHeader>

            <TableHeader
              sortable
              sortKey="title"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              Title
            </TableHeader>

            <TableHeader
              sortable
              sortKey="status"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              Status
            </TableHeader>

            <TableHeader
              sortable
              sortKey="internal_links"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              Internal Links
            </TableHeader>
            <TableHeader
              sortable
              sortKey="external_links"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              External Links
            </TableHeader>
            <TableHeader
              sortable
              sortKey="broken_links"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              Broken Links
            </TableHeader>

            <TableHeader
              sortable
              sortKey="created_at"
              currentSortBy={sortBy}
              currentSortOrder={sortOrder}
              onSort={onSort}
            >
              Created
            </TableHeader>
          </tr>
        </thead>

        <tbody 
          className="bg-white divide-y divide-gray-100"
          role="rowgroup"
        >
          {urls.map((url, index) => (
            <URLTableRow
              key={url.id}
              url={url}
              isSelected={selectedIds.includes(url.id)}
              onToggleSelection={onToggleSelection}
              onNavigate={onNavigate}
              clickable={true}
              rowIndex={index + 2}
            />
          ))}
        </tbody>
      </table>
    </Container>
  );
});
