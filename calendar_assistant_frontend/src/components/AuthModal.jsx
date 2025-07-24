import React, { useState, useEffect } from 'react';
import { startAuth, completeAuth } from '../services/auth';

const AuthModal = ({ onClose, onAuthenticated }) => {
  const [authInfo, setAuthInfo] = useState(null);
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initiateAuth = async () => {
      try {
        setStatus('starting');
        const result = await startAuth();
        
        if (result.status === 'device_code_required') {
          setAuthInfo(result);
          setStatus('device_code_required');
          
          // 尝试完成设备码流程
          try {
            setStatus('completing');
            const completion = await completeAuth(result.flow, result.cache);
            
            if (completion.status === 'success') {
              setStatus('success');
              setTimeout(() => {
                onAuthenticated();
                onClose();
              }, 1500);
            } else {
              setStatus('error');
              setError('身份验证失败，请重试');
            }
          } catch (e) {
            setStatus('error');
            setError(e.message || '身份验证过程中发生错误');
          }
        } else if (result.status === 'success') {
          setStatus('success');
          setTimeout(() => {
            onAuthenticated();
            onClose();
          }, 1500);
        }
      } catch (err) {
        setStatus('error');
        setError(err.message || '启动身份验证失败');
      }
    };

    initiateAuth();
  }, [onClose, onAuthenticated]);

  const renderContent = () => {
    switch (status) {
      case 'starting':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>正在启动身份验证...</p>
          </div>
        );
      
      case 'device_code_required':
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Microsoft 身份验证</h3>
            <p className="mb-4">请在浏览器中完成身份验证:</p>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p className="text-center font-mono text-lg mb-2">{authInfo.user_code}</p>
              <p className="text-center text-sm text-gray-600">设备代码</p>
            </div>
            
            <div className="mb-6">
              <p className="mb-2">1. 访问验证网站:</p>
              <a 
                href={authInfo.verification_uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block mb-4"
              >
                {authInfo.verification_uri}
              </a>
              
              <p className="mb-2">2. 输入上面的设备代码</p>
              <p className="mb-2">3. 按照提示登录您的Microsoft账户</p>
              <p className="mb-2">4. 完成后不要关闭此窗口，系统会自动继续</p>
            </div>
            
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>等待验证完成...</p>
            </div>
          </div>
        );
      
      case 'completing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>正在完成身份验证...</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center py-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold mb-2">身份验证成功!</h3>
            <p>您已成功连接到Microsoft日历</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">身份验证错误</h3>
            <p className="mb-4">{error || '发生未知错误'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;