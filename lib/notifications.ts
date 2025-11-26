// Simple console notification for development
export const notifyMockFallback = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('📝 Mock Data Fallback:', message);
  }
};