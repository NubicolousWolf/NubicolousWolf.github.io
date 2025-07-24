import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // 你的CSS可直接复制进来

function App() {
  const [input, setInput] = useState('');
  const [progress, setProgress] = useState({ show: false, percent: 0, status: '正在处理...' });
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(0);
  const [authModal, setAuthModal] = useState(null);

  // 插入测试
  const handleExample = () => {
    setInput(
      "明天下午2-4点开项目会议，地点在201会议室，讨论季度目标\n" +
      "后天上午10点线上会议，使用Teams，评审设计方案\n" +
      "周五下午3点与张经理面谈，地点在公司咖啡厅，讨论新合同细节"
    );
  };

  // 清空
  const handleClear = () => {
    setInput('');
    setEvents([]);
    setResults([]);
    setSelected(0);
  };

  // 一键创建
  const handleCreate = async () => {
    if (!input.trim()) {
      alert('请输入日程描述');
      return;
    }
    setProgress({ show: true, percent: 0, status: '正在处理...' });
    setEvents([]);
    setResults([]);
    setSelected(0);

    // 进度模拟
    const setStep = (percent, status) => setProgress({ show: true, percent, status });

    try {
      setStep(10, '解析自然语言描述...');
      // 1. 解析
      const parseRes = await axios.post('http://localhost:5000/parse', { text: input });
      setStep(40, '提取事件信息...');
      setEvents(parseRes.data.events);

      // 2. 获取token
      setStep(60, '获取Microsoft认证...');
      const tokenRes = await axios.get('http://localhost:5000/get_token');
      if (tokenRes.data.device_flow) {
        // 需要设备码认证
        setAuthModal(tokenRes.data.device_flow);
        setStep(60, '等待用户完成认证...');
        // 轮询token
        let token = null;
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 3000));
          const poll = await axios.get('http://localhost:5000/get_token');
          if (poll.data.access_token) {
            token = poll.data.access_token;
            setAuthModal(null);
            break;
          }
        }
        if (!token) throw new Error('认证超时，请重试');
        setStep(80, '认证成功，正在创建事件...');
        // 3. 创建事件
        const createRes = await axios.post('http://localhost:5000/create_events', {
          access_token: token,
          events: parseRes.data.events
        });
        setResults(createRes.data.results);
        setStep(100, '全部完成');
      } else if (tokenRes.data.access_token) {
        setStep(80, '认证成功，正在创建事件...');
        // 3. 创建事件
        const createRes = await axios.post('http://localhost:5000/create_events', {
          access_token: tokenRes.data.access_token,
          events: parseRes.data.events
        });
        setResults(createRes.data.results);
        setStep(100, '全部完成');
      } else {
        throw new Error('无法获取认证信息');
      }
    } catch (err) {
      setProgress({ show: false, percent: 0, status: '' });
      alert('操作失败: ' + (err.response?.data?.error || err.message));
      return;
    }
    setTimeout(() => setProgress({ show: false, percent: 0, status: '' }), 800);
  };

  // 事件详情
  const currentEvent = results[selected]?.event || events[selected] || {};

  return (
    <div id="root">
      <header>
        <div className="header-content">
          <h1 className="app-title">智能日历助手</h1>
          <p className="app-subtitle">使用自然语言创建Outlook日历事件</p>
        </div>
      </header>
      <main>
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h2>日程安排描述</h2>
            </div>
            <div className="card-body">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="例如：&#10;- 明天下午2点团队会议，地点在201会议室，讨论季度目标&#10;- 后天上午10点线上会议，使用Teams，评审设计方案&#10;- 周五下午3点与张经理面谈，地点在公司咖啡厅，讨论新合同细节"
              />
              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleCreate}>
                  <i className="fas fa-calendar-plus"></i>创建日历事件
                </button>
                <button className="btn btn-outline" onClick={handleExample}>
                  <i className="fas fa-lightbulb"></i>插入测试文本
                </button>
                <button className="btn btn-outline" onClick={handleClear}>
                  <i className="fas fa-trash-alt"></i>清空
                </button>
              </div>
              {progress.show && (
                <div className="progress-container">
                  <div className="progress-info">
                    <span>{progress.status}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.percent}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {(results.length > 0 || events.length > 0) && (
            <div className="results-grid">
              <div className="event-list">
                <div className="event-list-header">
                  解析的事件 (<span>{results.length || events.length}</span>)
                </div>
                <div>
                  {(results.length > 0 ? results : events).map((e, i) => (
                    <div
                      key={i}
                      className={`event-item ${i === selected ? 'selected' : ''}`}
                      onClick={() => setSelected(i)}
                    >
                      <div className="event-title">{e.event?.SUBJECT || e.SUBJECT || e.subject}</div>
                      <div className="event-time">
                        {formatDateTime(e.event?.START || e.START || e.start)} - {formatTime(e.event?.END || e.END || e.end)}
                      </div>
                      {e.success !== undefined && (
                        <div className={`event-status ${e.success ? 'status-success' : 'status-error'}`}>
                          {e.success ? '✓ 创建成功' : '✗ 创建失败'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="event-details">
                {currentEvent.SUBJECT || currentEvent.subject ? (
                  <>
                    <h3 className="event-title" style={{ marginBottom: '1.5rem' }}>
                      {currentEvent.SUBJECT || currentEvent.subject}
                    </h3>
                    <div className="detail-item">
                      <div className="detail-label">开始时间</div>
                      <div className="detail-value">{formatDateTime(currentEvent.START || currentEvent.start)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">结束时间</div>
                      <div className="detail-value">{formatDateTime(currentEvent.END || currentEvent.end)}</div>
                    </div>
                    {currentEvent.LOCATION || currentEvent.location ? (
                      <div className="detail-item">
                        <div className="detail-label">地点</div>
                        <div className="detail-value">{currentEvent.LOCATION || currentEvent.location}</div>
                      </div>
                    ) : null}
                    {currentEvent.DESCRIPTION || currentEvent.description ? (
                      <div className="detail-item">
                        <div className="detail-label">描述</div>
                        <div className="detail-value">{currentEvent.DESCRIPTION || currentEvent.description}</div>
                      </div>
                    ) : null}
                    {results[selected] && (
                      <div className="detail-item" style={{ marginTop: '2rem' }}>
                        <div className="detail-label">创建结果</div>
                        {results[selected].success ? (
                          <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: 8, marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', color: '#155724', marginBottom: 8 }}>
                              <i className="fas fa-check-circle" style={{ marginRight: 8 }}></i>
                              <span style={{ fontWeight: 500 }}>事件创建成功</span>
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <div><strong>事件ID:</strong> {results[selected].id}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ backgroundColor: '#f8d7da', padding: '1rem', borderRadius: 8, marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', color: '#721c24', marginBottom: 8 }}>
                              <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }}></i>
                              <span style={{ fontWeight: 500 }}>事件创建失败</span>
                            </div>
                            <div><strong>错误信息:</strong> {results[selected].error}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#888' }}>请选择左侧事件查看详情</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer>
        <p>智能日历助手 &copy; 2023 | 让日程管理更简单</p>
      </footer>
      {/* 认证弹窗 */}
      {authModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="modal-title">Microsoft 认证</span>
              <button className="modal-close" onClick={() => setAuthModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="auth-code">
                <div>请在新窗口打开以下网址并输入验证码完成认证：</div>
                <div className="code-value">{authModal.user_code}</div>
                <div style={{ marginTop: 8 }}>
                  <a href={authModal.verification_uri} target="_blank" rel="noopener noreferrer" style={{ color: '#4a76d0', fontWeight: 600 }}>
                    {authModal.verification_uri}
                  </a>
                </div>
              </div>
              <div className="auth-steps">
                <div className="auth-step">
                  <div className="step-number">1</div>
                  <div className="step-content">点击上方链接，进入Microsoft认证页面</div>
                </div>
                <div className="auth-step">
                  <div className="step-number">2</div>
                  <div className="step-content">输入验证码：<b>{authModal.user_code}</b></div>
                </div>
                <div className="auth-step">
                  <div className="step-number">3</div>
                  <div className="step-content">登录并授权访问日历</div>
                </div>
              </div>
              <div className="loading-spinner"></div>
              <div style={{ textAlign: 'center', color: '#888' }}>等待认证完成...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 工具函数
function formatDateTime(str) {
  if (!str) return '';
  const date = new Date(str);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
function formatTime(str) {
  if (!str) return '';
  const date = new Date(str);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default App;