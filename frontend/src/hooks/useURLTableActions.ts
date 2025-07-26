import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBulkAction } from "./useURLs";

export const useURLTableActions = (selectedIds: number[], clearSelection: () => void) => {
  const navigate = useNavigate();
  const bulkActionMutation = useBulkAction();

  const handleBulkAction = useCallback((
    action: "stop" | "delete" | "recrawl"
  ) => {
    if (selectedIds.length === 0) return;

    bulkActionMutation.mutate(
      { ids: selectedIds, action },
      { onSuccess: clearSelection }
    );
  }, [selectedIds, bulkActionMutation, clearSelection]);

  const handleNavigate = useCallback((id: number) => {
    navigate(`/url/${id}`);
  }, [navigate]);

  return {
    handleBulkAction,
    handleNavigate,
    bulkActionMutation,
  };
};