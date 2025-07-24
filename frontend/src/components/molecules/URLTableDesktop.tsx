import React from "react";
import { URLTableRow } from "./URLTableRow";
import { CheckboxCell, TableHeader, Container } from "../ui";
import type { URL } from "../../types";

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

export const URLTableDesktop: React.FC<URLTableDesktopProps> = ({
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
  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      onSelectAll(urls);
    } else {
      onClearSelection();
    }
  };

  return (
    <Container className={`hidden lg:block overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <CheckboxCell
              checked={isAllSelected}
              onChange={handleSelectAllChange}
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

            <TableHeader>Internal Links</TableHeader>
            <TableHeader>External Links</TableHeader>
            <TableHeader>Broken Links</TableHeader>

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

        <tbody className="bg-white divide-y divide-gray-100">
          {urls.map((url) => (
            <URLTableRow
              key={url.id}
              url={url}
              isSelected={selectedIds.includes(url.id)}
              onToggleSelection={onToggleSelection}
              onNavigate={onNavigate}
              clickable={true}
            />
          ))}
        </tbody>
      </table>
    </Container>
  );
};
