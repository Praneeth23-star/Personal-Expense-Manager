import React, { useState } from 'react';
import { askAdvisorApi } from '../services/api';
import { Sparkles, Send, Bot, User, ArrowRight, X } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'How can I save $200 more this month?',
  'Explain the 50/30/20 budget framework for my income',
  'What should I prioritize: an emergency fund or investments?',
  'How can I reduce recurring subscription expenses?',
];

const AIAdvisorChatModal = ({ isOpen, onClose, currency = '$' }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Financial Advisor. I have access to your recorded transactions, category breakdowns, and monthly budget limits. How can I help optimize your finances today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAdvisorApi(q);
      const aiReply = { sender: 'ai', text: res.data.answer };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I encountered an issue analyzing your financial records. Please try asking again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-primary text-white py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-white text-primary p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">AI Financial Health Assistant</h5>
                <small className="text-white-50">Trained on wealth management & budget optimization</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          {/* Chat Messages */}
          <div
            className="modal-body p-4 bg-light"
            style={{ maxHeight: '420px', minHeight: '340px', overflowY: 'auto' }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex gap-3 mb-3 ${
                  msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                    <Bot size={18} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-4 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white text-dark border'
                  }`}
                  style={{ maxWidth: '80%', whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="bg-secondary text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="d-flex gap-3 mb-3 justify-content-start">
                <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                  <Bot size={18} />
                </div>
                <div className="p-3 rounded-4 bg-white border text-muted small shadow-sm d-flex align-items-center gap-2">
                  <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                  <span>Advisor is analyzing your cash flow data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="px-4 py-2 bg-white border-top">
            <div className="small text-muted mb-2 fw-semibold">Suggested Questions:</div>
            <div className="d-flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-outline-secondary btn-sm py-1 px-2 rounded-pill small"
                  style={{ fontSize: '0.76rem' }}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="modal-footer bg-white border-top-0 p-3">
            <form
              className="input-group w-100"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Ask your financial advisor anything (e.g. How can I optimize my food budget?)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-1"
                disabled={loading || !input.trim()}
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisorChatModal;
