import React, { useState, useEffect } from 'react';
import { SupportTicket, SupportMessage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { 
  HelpCircle, 
  MessageCircle, 
  Send, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Headphones, 
  Sparkles,
  Bot
} from 'lucide-react';

interface SupportPageProps {
  openHermesAI: () => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ openHermesAI }) => {
  const { user } = useAuth();
  const { settings } = useStoreSettings();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // New ticket modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Recargas y Pedidos');
  const [messageText, setMessageText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await api.getTickets(user?.email);
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      api.getTicketMessages(selectedTicket.id).then(setMessages).catch(console.error);
    }
  }, [selectedTicket]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !messageText) return;

    setSubmitting(true);
    try {
      const res = await api.createTicket({
        customerName: user?.name || 'Cliente NEXPLAY',
        customerEmail: user?.email || 'cliente@gmail.com',
        subject,
        category,
        message: messageText
      });
      setShowNewModal(false);
      setSubject('');
      setMessageText('');
      fetchTickets();
      setSelectedTicket(res.ticket);
    } catch (err) {
      alert('Error al crear ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const msg = await api.sendTicketMessage(selectedTicket.id, {
        senderId: user?.email || 'user',
        senderName: user?.name || 'Cliente',
        senderRole: user?.role || 'USER',
        message: newMessage.trim()
      });
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      alert('Error al enviar mensaje');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-bold border border-cyan-500/30">
            <Headphones className="w-4 h-4" />
            <span>Centro de Soporte NEXPLAY</span>
          </div>
          <h1 className="text-3xl font-black text-white">¿En qué te podemos ayudar?</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Resuelve tus dudas en tiempo real con Hermes-agent, contáctanos por WhatsApp o abre un ticket de atención directa.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={openHermesAI}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/40 text-indigo-200 hover:border-indigo-400 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Hermes-agent IA</span>
          </button>

          <a
            href={`https://wa.me/${settings.supportPhoneWhatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Directo</span>
          </a>
        </div>
      </div>

      {/* Tickets Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ticket List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mis Tickets de Soporte</h3>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Ticket</span>
            </button>
          </div>

          <div className="space-y-2">
            {tickets.map(tkt => (
              <div
                key={tkt.id}
                onClick={() => setSelectedTicket(tkt)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTicket?.id === tkt.id
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-white">{tkt.ticketNumber}</span>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {tkt.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{tkt.subject}</h4>
                <p className="text-[10px] text-slate-500 mt-2">{new Date(tkt.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail & Messages */}
        <div className="md:col-span-2">
          {selectedTicket ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl flex flex-col h-[500px]">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{selectedTicket.subject}</h3>
                  <span className="text-xs font-mono text-cyan-400">{selectedTicket.ticketNumber}</span>
                </div>
                <p className="text-xs text-slate-400">Categoría: {selectedTicket.category}</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.senderRole === 'SUPPORT' || m.senderRole === 'ADMIN' ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                        m.senderRole === 'SUPPORT' || m.senderRole === 'ADMIN'
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-cyan-500 text-slate-950 font-medium'
                      }`}
                    >
                      <span className="text-[10px] font-bold opacity-80 block">{m.senderName}</span>
                      <p>{m.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Escribe tu respuesta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
              Selecciona un ticket para ver la conversación con soporte.
            </div>
          )}
        </div>

      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white">Crear Nuevo Ticket de Soporte</h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Asunto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consulta sobre recarga de Gold"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Recargas y Pedidos">Recargas y Pedidos</option>
                  <option value="Pagos y Comprobantes">Pagos y Comprobantes</option>
                  <option value="ID de Jugador">ID de Jugador / User ID</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mensaje explicativo</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribe los detalles de tu consulta..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl"
                >
                  {submitting ? 'Enviando...' : 'Crear Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
