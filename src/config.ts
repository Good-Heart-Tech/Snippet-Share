export const config = {
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8787',
  getSnippetUrl: (id: string) => `${config.baseUrl}/${id}`,
  getApiUrl: (path: string) => `${config.apiUrl}${path}`,
}; 