import React from "react";
import { AlertTriangle } from "lucide-react";
import { CheckboxCell, TableCell, Text, Badge, StatusBadge } from "../ui";
import type { URL } from "../../types";

export interface URLTableRowProps {
  url: URL;
  isSelected: boolean;
  onToggleSelection: (id: number) => void;
  onNavigate: (id: number) => void;
  clickable?: boolean;
  rowIndex?: number;
}

export const URLTableRow: React.FC<URLTableRowProps> = ({
  url,
  isSelected,
  onToggleSelection,
  onNavigate,
  clickable = true,
  rowIndex,
}) => {
  const latestResult = url.results?.[0];

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("input, button, a")) {
      return;
    }

    if (clickable) {
      onNavigate(url.id);
    }
  };

  return (
    <tr
      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
        clickable ? "cursor-pointer" : ""
      }`}
      onClick={handleRowClick}
      role="row"
      aria-selected={isSelected}
      aria-rowindex={rowIndex}
      {...(clickable && {
        tabIndex: 0,
        "aria-label": `URL: ${url.url}, Status: ${url.status}`,
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onNavigate(url.id);
          }
        },
      })}
    >
      <CheckboxCell
        checked={isSelected}
        onChange={() => onToggleSelection(url.id)}
        aria-label={`Select URL ${url.url}`}
      />

      <TableCell maxWidth="xs" truncate title={url.url} role="cell">
        <Text variant="body" className="text-sm font-medium text-gray-900">
          {url.url}
        </Text>
      </TableCell>

      <TableCell
        maxWidth="xs"
        truncate
        title={url.title || latestResult?.title || "-"}
        role="cell"
      >
        <Text variant="body" className="text-sm text-gray-700 font-medium">
          {url.title || latestResult?.title || "-"}
        </Text>
      </TableCell>

      <TableCell role="cell">
        <div className="flex items-center gap-2">
          <StatusBadge status={url.status} />
          {url.status === 'error' && url.error_message && (
            <div 
              className="text-red-500 cursor-help" 
              title={url.error_message}
              role="img"
              aria-label={`Error: ${url.error_message}`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>
      </TableCell>

      <TableCell role="cell">
        <Badge variant="info" size="sm">
          {latestResult?.internal_links ?? "-"}
        </Badge>
      </TableCell>

      <TableCell role="cell">
        <Badge variant="success" size="sm">
          {latestResult?.external_links ?? "-"}
        </Badge>
      </TableCell>

      <TableCell role="cell">
        <Badge variant="danger" size="sm">
          {latestResult?.broken_links ?? "-"}
        </Badge>
      </TableCell>

      <TableCell role="cell">
        <Text variant="body" className="text-sm text-gray-600 font-medium">
          {new Date(url.created_at).toLocaleDateString()}
        </Text>
      </TableCell>
    </tr>
  );
};
