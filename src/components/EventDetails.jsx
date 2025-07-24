import React from 'react';

const EventDetails = ({ event }) => {
  if (!event) return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
      <p className="text-gray-500">选择一个事件查看详情</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{event.subject}</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">开始时间</h3>
          <p className="mt-1">{new Date(event.start).toLocaleString()}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">结束时间</h3>
          <p className="mt-1">{new Date(event.end).toLocaleString()}</p>
        </div>
        
        {event.location && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">地点</h3>
            <p className="mt-1">{event.location}</p>
          </div>
        )}
        
        {event.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">描述</h3>
            <p className="mt-1 whitespace-pre-line">{event.description}</p>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-500">创建结果</h3>
          <div className="mt-2">
            {event.result.status === 'success' ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center text-green-800">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">事件创建成功</span>
                </div>
                
                {event.result.web_link && (
                  <div className="mt-3">
                    <a 
                      href={event.result.web_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center"
                    >
                      在日历中查看
                      <svg className="h-4 w-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center text-red-800">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">事件创建失败</span>
                </div>
                
                <p className="mt-2 text-sm text-red-700">
                  {event.result.message || '未知错误'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;