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
    const response = await apiRequest('POST', '/.netlify/functions/visitors', visitor);

    if (!response.ok) {
      const text = await response.text();
      console.error('API error response:', response.status, text);
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/visitors'] });
  },
});

}
