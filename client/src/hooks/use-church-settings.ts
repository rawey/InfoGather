import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChurchSettings, InsertChurchSettings } from "@shared/schema";

export function useChurchSettings() {
  return useQuery<ChurchSettings>({
    queryKey: ['/api/church-settings'],
  });
}

export function useUpdateChurchSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: InsertChurchSettings) => {
      const response = await apiRequest('POST', '/.netlify/functions/church-settings', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/church-settings'] });
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/church-settings'] });
    },
  });
}
