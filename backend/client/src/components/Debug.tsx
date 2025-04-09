import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Debug: React.FC = () => {
  const { user } = useAuth();
  
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 bg-yellow-50 border border-yellow-200 p-2 text-xs">
      <pre>
        {JSON.stringify({
          user: {
            _id: user?._id,
            username: user?.username,
            role: user?.role,
            type: user?.type
          }
        }, null, 2)}
      </pre>
    </div>
  );
}; 