import React from "react";
import { X } from "lucide-react";
import { SearchInput } from "../features/SearchInput";
import { BulkActionBar } from "../features/BulkActionBar";
import { Button, Text, Stack, Flex } from "../ui";

export interface URLTableHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onBulkAction: (action: "start" | "stop" | "delete" | "recrawl") => void;
  bulkActionDisabled?: boolean;
  sortBy?: string;
  onClearSort?: () => void;
  className?: string;
}

export const URLTableHeader: React.FC<URLTableHeaderProps> = ({
  searchValue,
  onSearchChange,
  selectedCount,
  onBulkAction,
  bulkActionDisabled = false,
  sortBy,
  onClearSort,
  className = "",
}) => {
  const showClearSort = sortBy && sortBy !== "created_at" && onClearSort;

  return (
    <div className={className}>
      <Stack spacing="lg">
        <Flex direction="col" gap="sm" className="xs:flex-row xs:items-center">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search URLs or titles..."
          />

          {showClearSort && (
            <Button
              variant="secondary"
              onClick={onClearSort}
              icon={X}
              className="px-3 py-2.5 text-sm flex-shrink-0"
              title="Clear sorting"
            >
              <Text className="hidden xs:inline text-sm">Clear Sort</Text>
            </Button>
          )}
        </Flex>

        <BulkActionBar
          selectedCount={selectedCount}
          onAction={onBulkAction}
          disabled={bulkActionDisabled}
        />
      </Stack>
    </div>
  );
};
