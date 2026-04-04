import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  MessageCircle,
  Zap,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { chatService } from '../../services/api';
import { useApplication } from '../../context/ApplicationContext';

// ✅ Simple markdown formatter
const FormattedMessage = ({ content, isUser }) => {
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
        <strong key={match.index} className={`font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`}>
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
    
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const text = trimmed.substring(1).trim();
      return (
        <div key={index} className="flex gap-2 my-1.5 ml-1">
          <span className={isUser ? 'text-blue-200' : 'text-blue-500'}>•</span>
          <span className="flex-1">{formatText(text)}</span>
        </div>
      );
    }
    
    if (/^[\u{1F000}-\u{1F9FF}]/u.test(trimmed)) {
      return <p key={index} className="font-medium my-2">{formatText(line)}</p>;
    }
    
    if (!trimmed) {
      return <div key={index} className="h-2" />;
    }
    
    return <p key={index} className="my-0.5">{formatText(line)}</p>;
  };
  
  return (
    <div className="text-[15px] leading-relaxed">
      {content.split('\n').map((line, index) => formatLine(line, index))}
    </div>
  );
};

function Chat() {
  const navigate = useNavigate();
  const messagesContainerRef = useRef(null);
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
  const [showRiskProfile, setShowRiskProfile] = useState(false);

  // ✅ Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // ✅ Scroll when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // ✅ Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      inputRef.current?.focus();
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
    { text: "Why is my risk score " + (riskContext?.risk_score * 100).toFixed(0) + "%?", icon: TrendingUp },
    { text: "How can I reduce my premium?", icon: Zap },
    { text: userProfile?.smoker ? "What if I quit smoking?" : "What if I exercise more?", icon: Shield },
    { text: "Explain my top risk factors", icon: MessageCircle }
  ] : [
    { text: "What factors affect insurance risk?", icon: TrendingUp },
    { text: "How does smoking impact premiums?", icon: Zap },
    { text: "What is a good BMI range?", icon: Shield },
    { text: "Tell me about risk categories", icon: MessageCircle }
  ];

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date().toISOString()
    }]);
  };

  const getRiskColor = (score) => {
    if (score > 0.7) return { 
      bg: 'bg-gradient-to-r from-red-500 to-rose-500', 
      text: 'text-red-500', 
      light: 'bg-red-50/80', 
      border: 'border-red-200/50',
      dot: 'bg-red-500',
      glow: 'shadow-red-500/25'
    };
    if (score > 0.5) return { 
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500', 
      text: 'text-amber-500', 
      light: 'bg-amber-50/80', 
      border: 'border-amber-200/50',
      dot: 'bg-amber-500',
      glow: 'shadow-amber-500/25'
    };
    return { 
      bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', 
      text: 'text-emerald-500', 
      light: 'bg-emerald-50/80', 
      border: 'border-emerald-200/50',
      dot: 'bg-emerald-500',
      glow: 'shadow-emerald-500/25'
    };
  };

  const riskColors = getRiskColor(riskContext?.risk_score || 0);

  // No Application State
  if (!hasApplication) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 border border-white/50 p-8 text-center">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-ping"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-10 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="relative w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30">
                <Bot className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              No Risk Assessment Yet
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Complete a quick risk assessment so I can provide you with personalized insights and recommendations.
            </p>
            
            <button
              onClick={() => navigate('/apply')}
              className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium"
            >
              <Shield className="w-5 h-5" />
              Start Risk Assessment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Takes only 2 minutes to complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-gray-100 overflow-hidden"
      style={{ height: '88vh', maxHeight: '90vh' }}
    >
      {/* Header - Fixed with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm shrink-0">
        <div className="w-full px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Bot Info */}
            <div className="flex items-center gap-2">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm">
                  <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></span>
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  LiveRisk AI
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>

            {/* Center: Compact Risk Stats */}
            <div className="hidden md:flex items-center gap-4 px-5 py-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100/50 shadow-inner">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${riskColors.dot} shadow-lg ${riskColors.glow}`}></div>
                <span className="text-sm font-medium text-gray-600">
                  Risk: <span className={`font-bold ${riskColors.text}`}>{(riskContext?.risk_score * 100).toFixed(0)}%</span>
                </span>
              </div>
              <div className="w-px h-4 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm font-medium text-gray-600">
                Premium: <span className="font-bold text-gray-900">${riskContext?.premium_estimate?.toLocaleString()}</span>
              </span>
              <div className="w-px h-4 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${riskColors.light} ${riskColors.text}`}>
                {riskContext?.risk_label}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRiskProfile(!showRiskProfile)}
                className="md:hidden flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-lg text-sm transition-all"
              >
                <Shield className="w-4 h-4" />
                {showRiskProfile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={clearChat}
                className="group flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-sm font-medium hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Mobile Risk Profile Dropdown */}
          {showRiskProfile && (
            <div className="md:hidden mt-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100/50 shadow-inner animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`p-2 rounded-lg ${riskColors.light}`}>
                  <p className="text-xs text-gray-500">Risk Score</p>
                  <p className={`text-lg font-bold ${riskColors.text}`}>{(riskContext?.risk_score * 100).toFixed(0)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-50/80">
                  <p className="text-xs text-gray-500">Premium</p>
                  <p className="text-lg font-bold text-gray-800">${riskContext?.premium_estimate?.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-lg ${riskColors.light}`}>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-lg font-bold ${riskColors.text}`}>{riskContext?.risk_label}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Messages Container - Scrollable area with subtle pattern */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{ 
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              style={{
                animation: 'fadeInUp 0.3s ease-out forwards',
                animationDelay: `${index * 0.05}s`
              }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col max-w-[80%] lg:max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl transition-all duration-200 hover:shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 text-white rounded-tr-sm shadow-lg shadow-blue-500/20'
                    : message.error 
                      ? 'bg-gradient-to-br from-red-50 to-red-100/50 text-red-700 border border-red-200/50 rounded-tl-sm shadow-lg shadow-red-500/10'
                      : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-100/50 rounded-tl-sm shadow-lg shadow-gray-200/50'
                }`}>
                  <FormattedMessage content={message.content} isUser={message.role === 'user'} />
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 rounded-full hover:from-blue-100 hover:to-purple-100 transition-all font-medium border border-blue-100/50 hover:border-blue-200 shadow-sm hover:shadow"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Loading Animation */}
          {loading && (
            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-40 animate-pulse"></div>
                <div className="relative w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm border border-gray-100/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg shadow-gray-200/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-400 ml-2 font-medium">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Only show initially */}
      {messages.length <= 2 && (
        <div className="px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 shrink-0">
          <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap className="w-3 h-3 text-amber-500" />
            Suggested Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(action.text)}
                  className="group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 rounded-xl hover:from-white hover:to-gray-50 transition-all text-sm font-medium border border-gray-200/50 hover:border-gray-300 hover:shadow-md"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="truncate max-w-[200px]">{action.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area - Fixed at Bottom with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-4 shrink-0 shadow-lg shadow-gray-200/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="relative w-full px-5 py-4 bg-gray-50/80 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all text-gray-700 placeholder-gray-400 text-base shadow-inner"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="group relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-500 hover:to-purple-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none flex-shrink-0 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Send className="relative w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-200">Enter</kbd>
              to send
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-200">Shift</kbd>
              +
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-200">Enter</kbd>
              new line
            </span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Chat;