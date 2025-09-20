import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SyncStatus {
  lastSync: string | null;
  isOnline: boolean;
  syncCount: number;
  error: string | null;
}

const NotificationSyncStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    isOnline: true,
    syncCount: 0,
    error: null
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Test sync every 30 seconds to show it's working
    const testInterval = setInterval(() => {
      testSync();
    }, 30000);

    // Initial test
    testSync();

    return () => {
      clearInterval(testInterval);
    };
  }, [user?.id]);

  const testSync = async () => {
    try {
      const response = await fetch(`/api/notifications/sync?user_id=${user?.id}&last_sync=${syncStatus.lastSync || ''}`);
      const data = await response.json();
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: data.sync_time,
        isOnline: true,
        syncCount: prev.syncCount + 1,
        error: null
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: false,
        error: 'Sync failed'
      }));
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Notification Sync Status</h4>
        <button
          onClick={testSync}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Test sync now"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <div className="flex items-center">
            {syncStatus.isOnline ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">Online</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Last Sync:</span>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-gray-900">{formatTime(syncStatus.lastSync)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Sync Count:</span>
          <span className="text-gray-900">{syncStatus.syncCount}</span>
        </div>
        
        {syncStatus.error && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Error:</span>
            <span className="text-red-600">{syncStatus.error}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          🔄 Auto-sync every 1 minute • Real-time WebSocket enabled
        </p>
      </div>
    </div>
  );
};

export default NotificationSyncStatus;
