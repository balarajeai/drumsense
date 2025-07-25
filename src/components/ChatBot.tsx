import { useState, useRef, useEffect } from 'react';
import { client } from '../mqttClient';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your Digital Twin Copilot. I can help you monitor the bottling line metrics, diagnose issues, and optimize performance. How can I assist you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [metrics, setMetrics] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMessage = (topic: string, message: any) => {
      const data = JSON.parse(message.toString());
      setMetrics((prevMetrics: any) => ({
        ...prevMetrics,
        [topic]: data
      }));
    };

    if (client) {
      client.on('message', handleMessage);
    }

    return () => {
      if (client) {
        client.removeListener('message', handleMessage);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('efficiency') || lowerMessage.includes('performance')) {
      return 'Current production efficiency is being monitored through our MQTT connection. The bottling line is operating at optimal capacity with real-time metrics being tracked.';
    }
    
    if (lowerMessage.includes('temperature') || lowerMessage.includes('heat')) {
      return 'Temperature monitoring is active across all machinery. All systems are operating within normal temperature ranges. Would you like specific temperature readings from any component?';
    }
    
    if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('error')) {
      return 'I\'m continuously monitoring the bottling line through MQTT for any anomalies. Currently, all systems are functioning within normal parameters. Let me know if you need specific metrics.';
    }
    
    if (lowerMessage.includes('quality') || lowerMessage.includes('defect')) {
      return 'The quality control system is actively monitoring the bottling process. Current metrics show normal operation with no significant defects detected.';
    }
    
    if (lowerMessage.includes('conveyor') || lowerMessage.includes('speed')) {
      return 'The conveyor system is running at optimal speed. I\'m monitoring its performance through our MQTT connection in real-time.';
    }
    
    return 'I can help you monitor the bottling line, check system status, and analyze performance metrics. What specific aspect would you like to know more about?';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    'Check bottling line status',
    'Monitor conveyor speed',
    'Check machine temperatures',
    'View production metrics'
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i className="ri-robot-line text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-medium">Digital Twin Copilot</h3>
            <p className="text-xs text-gray-400">Bottling Line Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-300">Connected</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.isUser 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-200 border border-gray-700'
            }`}>
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg max-w-[80%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInputValue(action)}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full border border-gray-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about bottling line status, metrics, or issues..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-send-plane-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
