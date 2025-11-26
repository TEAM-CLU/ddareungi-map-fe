import { useProvideWebviewMessenger } from '@/shared/hooks/useProvideWebviewMessenger';
import { use } from 'react';

export const useNavigationMessenger = () => {
  const { sendMessage } = useProvideWebviewMessenger();
};
