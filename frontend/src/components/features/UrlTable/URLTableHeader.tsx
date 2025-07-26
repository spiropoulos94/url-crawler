import React from "react";
import { X } from "lucide-react";
import { SearchInput } from "../SearchInput";
import { BulkActionBar } from "../BulkActionBar";
import { Button, Text, Stack, Flex } from "../../ui";

export interface URLTableHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onBulkAction: (action: "stop" | "delete" | "recrawl") => void;
  bulkActionDisabled?: boolean;
  sortBy?: string;
  onClearSort?: () => void;
  className?: string;
}

export const URLTableHeader: React.FC<URLTableHeaderProps> = React.memo(({
  searchValue,
  onSearchChange,
  selectedCount,
  onBulkAction,
  bulkActionDisabled = false,
  sortBy,
  onClearSort,
  className = "",
}) => {
  const showClearSort = React.useMemo(() => 
    sortBy && sortBy !== "created_at" && onClearSort, 
    [sortBy, onClearSort]
  );

  return (
    <div className={className}>
      <Stack spacing="lg">
        <Flex direction="col" gap="sm" className="xs:flex-row xs:items-center">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search URLs or titles..."
            className="w-full  md:max-w-md"
          />

          {showClearSort && (
            <Button
              variant="secondary"
              onClick={onClearSort}
              icon={X}
              className="text-sm flex-shrink-0"
              title="Clear sorting"
            >
              <Text>Clear Sort</Text>
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
});
