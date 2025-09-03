// src/components/ui/Loading.tsx
import { FaSpinner } from 'react-icons/fa';

export const Loading = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <FaSpinner className="animate-spin text-2xl text-blue-500" />
    </div>
  );
};