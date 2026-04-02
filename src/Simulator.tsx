import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RefreshCw, Bot, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function Simulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      const reply = data.reply || 'Error al responder.';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      if (reply.toLowerCase().includes('cuelgas') || reply.toLowerCase().includes('que tengas buen dia') || reply.toLowerCase().includes('colg')) {
        setCallEnded(true);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const startSimulation = async () => {
    setStarted(true);
    setCallEnded(false);
    const initMsg: Message[] = [{ role: 'user', content: 'Iniciar simulación' }];
    setMessages(initMsg);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: initMsg })
      });
      const data = await res.json();
      setMessages([...initMsg, { role: 'assistant', content: data.reply || 'Error.' }]);
    } catch {
      setMessages([...initMsg, { role: 'assistant', content: 'Error de conexión.' }]);
    }
    setLoading(false);
  };

  const reset = () => {
    setMessages([]);
    setStarted(false);
    setCallEnded(false);
    setInput('');
  };

  const isEval = messages.some(m => m.role === 'user' && m.content.toUpperCase().includes('EVALUAME'));

  return (
    <div className="flex flex-col h-[650px] bg-white/[0.02] border border-cenit-gold/20 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cenit-gold/10 bg-cenit-gold/5">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${started && !callEnded ? 'bg-green-400 animate-pulse' : callEnded ? 'bg-red-400' : 'bg-white/20'}`} />
          <span className="font-semibold text-cenit-gold text-xs uppercase tracking-widest">
            {!started ? 'Simulador Listo' : callEnded ? 'Llamada Terminada' : 'Simulación en Curso'}
          </span>
        </div>
        {started && (
          <button onClick={reset} className="flex items-center gap-1.5 text-white/40 hover:text-cenit-gold transition-colors text-xs">
            <RefreshCw size={12} /> Nueva sesión
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        <AnimatePresence>
          {!started ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center gap-6 py-12"
            >
              <div className="w-20 h-20 rounded-full bg-cenit-gold/10 border border-cenit-gold/20 flex items-center justify-center">
                <Bot size={36} className="text-cenit-gold" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3" style={{fontFamily:'serif'}}>Simulador de <span className="text-cenit-gold">Llamadas</span></h3>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                  Practica con un cliente venezolano real impulsado por IA. Sé evaluado al finalizar con puntuación detallada.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-white/30 max-w-xs">
                <div className="flex items-center gap-2"><span className="text-cenit-gold">01</span> El bot te preguntará qué producto practicar</div>
                <div className="flex items-center gap-2"><span className="text-cenit-gold">02</span> Tienes 5 segundos para captar su atención</div>
                <div className="flex items-center gap-2"><span className="text-cenit-gold">03</span> Escribe EVALUAME al terminar</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startSimulation}
                className="bg-cenit-gold text-cenit-black font-bold px-10 py-4 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-cenit-gold/20"
              >
                Iniciar Simulación
              </motion.button>
            </motion.div>
          ) : (
            <>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-cenit-gold/10 border border-cenit-gold/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <span className="text-cenit-gold text-xs font-bold">C</span>
                    </div>
                  )}
                  <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-cenit-gold text-cenit-black font-medium rounded-br-sm'
                      : 'bg-white/[0.05] border border-white/10 text-white/90 rounded-bl-sm'
                  }`}>
                    {m.role === 'assistant' && <span className="text-xs text-cenit-gold/60 font-semibold block mb-1 uppercase tracking-wider">Cliente</span>}
                    {m.role === 'user' && <span className="text-xs text-cenit-black/50 font-semibold block mb-1 uppercase tracking-wider">Agente</span>}
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-cenit-gold/10 border border-cenit-gold/20 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-cenit-gold text-xs font-bold">C</span>
                  </div>
                  <div className="bg-white/[0.05] border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-cenit-gold" />
                    <span className="text-white/30 text-xs">escribiendo...</span>
                  </div>
                </motion.div>
              )}

              {callEnded && !isEval && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center py-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <PhoneOff size={12} /> El cliente colgó
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      {started && (
        <div className="px-4 py-4 border-t border-cenit-gold/10 bg-cenit-black/40">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={callEnded && !isEval ? 'Escribe EVALUAME para ver tu puntuación...' : 'Escribe tu mensaje...'}
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cenit-gold/40 transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-12 h-12 rounded-xl bg-cenit-gold flex items-center justify-center hover:bg-cenit-gold-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={15} className="text-cenit-black" />
            </button>
          </div>
          <p className="text-white/15 text-[10px] mt-2 text-center tracking-wide">
            Escribe <span className="text-cenit-gold/40">EVALUAME</span> al terminar para recibir tu evaluación completa
          </p>
        </div>
      )}
    </div>
  );
}
