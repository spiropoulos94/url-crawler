import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlAPI } from "../services/api";
import type { PaginationParams, BulkActionRequest } from "../types";

export const useURLs = (params: PaginationParams) => {
  return useQuery({
    queryKey: [
      "urls",
      params.page,
      params.limit,
      params.search,
      params.sort_by,
      params.sort_order,
    ],
    queryFn: () => urlAPI.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useURL = (id: number) => {
  return useQuery({
    queryKey: ["url", id],
    queryFn: () => urlAPI.getById(id),
    enabled: !!(id && !isNaN(id)),
  });
};

export const useAddURL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: urlAPI.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
  });
};

export const useBulkAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkActionRequest) => urlAPI.bulkAction(data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch URLs
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      
      // If this was a delete action, also clear any cached individual URL data
      if (variables.action === 'delete') {
        variables.ids.forEach(id => {
          queryClient.removeQueries({ queryKey: ["url", id] });
        });
      }
    },
  });
};
