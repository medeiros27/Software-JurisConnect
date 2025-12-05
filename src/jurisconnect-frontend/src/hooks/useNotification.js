import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useNotification = () => {
  const success = useCallback((message) => {
    toast.success(message, {
      position: 'top-right',
      duration: 4000,
    });
  }, []);

  const error = useCallback((message) => {
    toast.error(message, {
      position: 'top-right',
      duration: 4000,
    });
  }, []);

  const loading = useCallback((message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  }, []);

  return { success, error, loading, dismiss: toast.dismiss };
};
