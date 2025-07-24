import React from 'react';

const EventList = ({ events, onSelectEvent, selectedIndex }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">解析的事件 ({events.length})</h2>
      </div>
      
      <div className="divide-y">
        {events.map((event, index) => (
          <div 
            key={index}
            className={`p-4 cursor-pointer transition-colors ${
              selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectEvent(index)}
          >
            <h3 className="font-bold text-gray-800 truncate">{event.subject}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleTimeString()}
            </p>
            
            <div className="mt-2">
              {event.result.status === 'success' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  创建成功
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  创建失败
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;