import React from "react";
import { Square, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Container, Grid } from "../ui/Layout";
import { Text } from "../ui/Typography";

export interface BulkActionBarProps {
  selectedCount: number;
  onAction: (action: "stop" | "recrawl" | "delete") => void;
  disabled?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onAction,
  disabled = false,
}) => {
  if (selectedCount === 0) return null;

  const actions = [
    {
      key: "stop" as const,
      icon: Square,
      label: "Stop",
      variant: "secondary" as const,
    },
    {
      key: "recrawl" as const,
      icon: RotateCcw,
      label: "Recrawl",
      variant: "success" as const,
    },
    {
      key: "delete" as const,
      icon: Trash2,
      label: "Delete",
      variant: "danger" as const,
    },
  ];

  return (
    <Container 
      className="w-full"
      role="toolbar"
      aria-label={`Bulk actions for ${selectedCount} selected items`}
      aria-describedby="bulk-action-description"
    >
      <div className="mb-2">
        <Text 
          id="bulk-action-description"
          variant="caption" 
          className="text-gray-600 font-medium"
        >
          {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
        </Text>
      </div>
      
      <Grid
        cols={2}
        className="xs:grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:gap-3 sm:justify-start"
      >
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.variant}
            onClick={() => onAction(action.key)}
            disabled={disabled}
            icon={action.icon}
            className="text-xs xs:text-sm px-3 py-2.5 justify-center"
            aria-label={`${action.label} ${selectedCount} selected item${selectedCount === 1 ? '' : 's'}`}
          >
            <Text className="hidden xs:inline text-xs xs:text-sm">
              {action.label}
            </Text>
          </Button>
        ))}
      </Grid>
    </Container>
  );
};
