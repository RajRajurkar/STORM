import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { chatService } from '../../services/api';
import { useApplication } from '../../context/ApplicationContext';

// ✅ Simple markdown formatter (no package needed)
const FormattedMessage = ({ content }) => {
  const formatText = (text) => {
    const parts = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-bold text-gray-900">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
  const formatLine = (line, index) => {
    const trimmed = line.trim();
    
    // Bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const text = trimmed.substring(1).trim();
      return (
        <div key={index} className="flex gap-2 my-1">
          <span className="text-blue-600">•</span>
          <span>{formatText(text)}</span>
        </div>
      );
    }
    
    // Emoji headers (like 🎯)
    if (/^[\u{1F000}-\u{1F9FF}]/u.test(trimmed)) {
      return <p key={index} className="font-semibold my-2">{formatText(line)}</p>;
    }
    
    // Empty line
    if (!trimmed) {
      return <br key={index} />;
    }
    
    // Regular line
    return <p key={index} className="my-1">{formatText(line)}</p>;
  };
  
  return (
    <div className="text-sm leading-relaxed">
      {content.split('\n').map((line, index) => formatLine(line, index))}
    </div>
  );
};

function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { getUserProfile, getRiskContext, hasApplication } = useApplication();
  const userProfile = getUserProfile();
  const riskContext = getRiskContext();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: hasApplication 
        ? `👋 Hello ${userProfile?.name || 'there'}! I'm LiveRisk AI. I can see you've completed a risk assessment with a score of **${(riskContext?.risk_score * 100).toFixed(0)}%** (${riskContext?.risk_label}).\n\nI can help you:\n• Understand your risk factors\n• Get personalized recommendations\n• Explore what-if scenarios\n• Answer questions about your premium\n\nWhat would you like to know?`
        : "👋 Hello! I'm LiveRisk AI, your intelligent insurance risk assistant. To provide personalized insights, please complete a risk assessment first.\n\nWhat would you like to know about insurance risk?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      console.log('📤 Sending:', userMessage.content);

      const response = await chatService.sendMessage(
        userMessage.content,
        userProfile,
        {
          riskContext: riskContext,
          history: history
        }
      );

      console.log('📥 Response:', response);

      const assistantMessage = {
        role: 'assistant',
        content: response.response || "I received your message.",
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('❌ Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting. Please ensure the backend is running at http://localhost:8000",
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const quickActions = hasApplication ? [
    "Why is my risk score " + (riskContext?.risk_score * 100).toFixed(0) + "%?",
    "How can I reduce my premium?",
    userProfile?.smoker ? "What if I quit smoking?" : "What if I exercise more?",
    "Explain my top risk factors"
  ] : [
    "What factors affect insurance risk?",
    "How does smoking impact premiums?",
    "What is a good BMI range?",
    "Tell me about risk categories"
  ];

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date().toISOString()
    }]);
  };

  const RiskSummaryCard = () => {
    if (!hasApplication) return null;

    return (
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Your Risk Profile</h3>
          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium" 
                style={{ color: riskContext?.risk_score > 0.7 ? '#EF4444' : 
                              riskContext?.risk_score > 0.5 ? '#F59E0B' : '#22C55E' }}>
            {riskContext?.risk_label}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Risk Score</p>
            <p className="font-bold text-lg">{(riskContext?.risk_score * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-gray-500">Est. Premium</p>
            <p className="font-bold text-lg">${riskContext?.premium_estimate?.toLocaleString()}</p>
          </div>
        </div>

        {riskContext?.top_risk_factors?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-gray-500 mb-1">Top Risk Factors:</p>
            <div className="flex flex-wrap gap-1">
              {riskContext.top_risk_factors.slice(0, 3).map((factor, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!hasApplication) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Bot className="w-16 h-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">No Assessment Yet</h2>
          <p className="text-gray-500 text-center max-w-md">
            Complete a risk assessment first so I can provide personalized insights.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Complete Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">LiveRisk AI Chat</h1>
            <p className="text-sm text-gray-500">Ask me anything about your risk profile</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-gray-100">
          <RiskSummaryCard />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-100' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}>
                {message.role === 'user' 
                  ? <User className="w-4 h-4 text-blue-600" />
                  : <Sparkles className="w-4 h-4 text-white" />
                }
              </div>

              <div className={`max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                } ${message.error ? 'bg-red-100 text-red-700' : ''}`}>
                  {/* ✅ Use simple formatter */}
                  <FormattedMessage content={message.content} />
                </div>

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-xs text-gray-400 mt-1 ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(action)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your risk, suggestions, or scenarios..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;