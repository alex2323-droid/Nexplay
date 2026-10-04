import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, RefreshCw, User, HelpCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

interface HermesAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame?: (gameId: string) => void;
}

export const HermesAgentDrawer: React.FC<HermesAgentDrawerProps> = ({ isOpen, onClose, onSelectGame }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: '¡Hola, Gamer! ⚡ Soy Hermes-agent, el asistente IA de NEXPLAY. Te puedo ayudar a encontrar tu ID de jugador para Blood Strike, Free Fire o Roblox, recomendarte ofertas o consultar el estado de tu pedido. ¿Qué necesitas hoy?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text
      }));

      const replyText = await api.askHermes(textToSend, history);

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: 'Disculpa, tuve un breve parpadeo en el servidor. Puedes intentar nuevamente o explorar directamente las recargas de Blood Strike, Free Fire y Roblox.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '¿Dónde está mi ID en Blood Strike?',
    '¿Dónde está mi ID en Free Fire?',
    '¿Hay algún cupón de descuento activo?',
    '¿Cuánto tarda la recarga en llegar?'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Hermes-agent</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 bg-cyan-950 border border-cyan-800/60 rounded">
                  GEMINI 3.8 AI
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Asistente de Recargas en Vivo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 rounded-lg whitespace-nowrap text-[11px] border border-slate-700/50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}
              <div 
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div 
                  className={`text-[9px] mt-1 text-right opacity-70 ${
                    msg.sender === 'user' ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div className="bg-slate-800 border border-slate-700/60 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Hermes-agent está escribiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Pregunta a Hermes sobre recargas o tu ID..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Atendido por Hermes Agent & Gemini 3.8 Flash SDK
          </p>
        </div>

      </div>
    </div>
  );
};
