import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Visitor, InsertVisitor } from "@shared/schema";

export function useVisitors() {
  return useQuery<Visitor[]>({
    queryKey: ['/api/visitors'],
  });
}

export function useCreateVisitor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (visitor: InsertVisitor) => {
      const response = await apiRequest('POST', '/api/visitors', visitor);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visitors'] });
    },
  });
}
