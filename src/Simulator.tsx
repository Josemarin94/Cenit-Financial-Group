import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Mic, MicOff, Volume2, VolumeX, PhoneOff, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = { role: 'user' | 'assistant'; content: string };

// Voices for speech synthesis
const getVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  // Try to find Spanish voice
  const spanish = voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('male'))
    || voices.find(v => v.lang.startsWith('es'))
    || voices.find(v => v.lang.startsWith('es-'))
    || null;
  return spanish;
};

export default function Simulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesRef = useRef<Message[]>([]);

  messagesRef.current = messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => setVoicesLoaded(true);
    window.speechSynthesis.onvoiceschanged = loadVoices;
    if (window.speechSynthesis.getVoices().length > 0) setVoicesLoaded(true);
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#•→←]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(clean);
    const voice = getVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'es-ES';
    utterance.rate = 0.92;
    utterance.pitch = 0.85;
    utterance.volume = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || loading) return;
    const current = messagesRef.current;
    const newMessages: Message[] = [...current, { role: 'user', content: userText }];
    setMessages(newMessages);
    setTranscript('');
    setLoading(true);
    window.speechSynthesis.cancel();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      const reply = data.reply || 'Error al responder.';
      const updated = [...newMessages, { role: 'assistant' as const, content: reply }];
      setMessages(updated);
      speak(reply);
      const lower = reply.toLowerCase();
      if (lower.includes('que tengas buen dia') || lower.includes('cuelga') || lower.includes('llamada terminada')) {
        setCallEnded(true);
      }
    } catch {
      const errMsg = 'Error de conexión. Intenta de nuevo.';
      setMessages([...newMessages, { role: 'assistant', content: errMsg }]);
    }
    setLoading(false);
  }, [loading, speak]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    window.speechSynthesis.cancel();
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(final || interim);
      if (final) {
        recognition.stop();
        sendMessage(final);
      }
    };
    recognition.onerror = () => { setListening(false); setTranscript(''); };
    recognition.onend = () => setListening(false);
    recognition.start();
  }, [listening, sendMessage]);

  const startSimulation = async () => {
    setStarted(true);
    setCallEnded(false);
    setMessages([]);
    setLoading(true);
    const initMsg: Message[] = [{ role: 'user', content: 'Iniciar simulación' }];
    setMessages(initMsg);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: initMsg })
      });
      const data = await res.json();
      const reply = data.reply || 'Error.';
      setMessages([...initMsg, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch {
      setMessages([...initMsg, { role: 'assistant', content: 'Error de conexión.' }]);
    }
    setLoading(false);
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    setMessages([]);
    setStarted(false);
    setCallEnded(false);
    setTranscript('');
    setListening(false);
    setSpeaking(false);
  };

  const isEval = messages.some(m => m.role === 'user' && m.content.toUpperCase().includes('EVALUAME'));

  return (
    <div className="flex flex-col h-[680px] bg-white/[0.02] border border-cenit-gold/20 rounded-3xl overflow-hidden shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cenit-gold/10 bg-cenit-gold/5">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
            !started ? 'bg-white/20'
            : callEnded ? 'bg-red-400'
            : listening ? 'bg-blue-400 animate-pulse'
            : speaking ? 'bg-cenit-gold animate-pulse'
            : 'bg-green-400 animate-pulse'
          }`} />
          <span className="font-semibold text-cenit-gold text-xs uppercase tracking-widest">
            {!started ? 'Simulador Listo'
              : callEnded ? 'Llamada Terminada'
              : listening ? 'Escuchando...'
              : speaking ? 'Cliente Hablando...'
              : loading ? 'Procesando...'
              : 'En Llamada'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {started && (
            <button
              onClick={() => { setVoiceEnabled(v => !v); window.speechSynthesis.cancel(); }}
              className="flex items-center gap-1.5 text-white/40 hover:text-cenit-gold transition-colors text-xs"
              title={voiceEnabled ? 'Silenciar cliente' : 'Activar voz'}
            >
              {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
          )}
          {started && (
            <button onClick={reset} className="flex items-center gap-1.5 text-white/40 hover:text-cenit-gold transition-colors text-xs">
              <RefreshCw size={12} /> Nueva sesión
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {!started ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center gap-6 py-8"
            >
              <div className="w-20 h-20 rounded-full bg-cenit-gold/10 border border-cenit-gold/20 flex items-center justify-center">
                <Phone size={32} className="text-cenit-gold" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3" style={{fontFamily:'serif'}}>
                  Simulador de <span className="text-cenit-gold">Llamadas</span>
                </h3>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                  Practica con un cliente venezolano real. Habla por micrófono o escribe. Recibe evaluación al finalizar.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center max-w-sm">
                {[
                  { icon: '🎙️', text: 'Habla por micrófono' },
                  { icon: '🇻🇪', text: 'Cliente venezolano IA' },
                  { icon: '📊', text: 'Evaluación detallada' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.03] border border-cenit-gold/10 rounded-xl p-3">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-[10px] text-white/40">{item.text}</div>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startSimulation}
                className="bg-cenit-gold text-cenit-black font-bold px-10 py-4 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-cenit-gold/20 flex items-center gap-2"
              >
                <Phone size={16} /> Iniciar Llamada
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

              {transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[78%] px-4 py-3 rounded-2xl text-sm bg-cenit-gold/20 border border-cenit-gold/30 text-white/60 italic rounded-br-sm">
                    <span className="text-xs text-cenit-gold/40 font-semibold block mb-1 uppercase tracking-wider">Escuchando...</span>
                    {transcript}
                  </div>
                </div>
              )}

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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center py-2">
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

      {/* Controls */}
      {started && (
        <div className="px-6 py-5 border-t border-cenit-gold/10 bg-cenit-black/40">
          <div className="flex items-center justify-center gap-4">
            {/* Mic Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startListening}
              disabled={loading || speaking}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed ${
                listening
                  ? 'bg-red-500 shadow-red-500/30 animate-pulse'
                  : 'bg-cenit-gold shadow-cenit-gold/20 hover:bg-cenit-gold-light'
              }`}
            >
              {listening ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-cenit-black" />}
            </motion.button>

            <div className="text-center">
              <p className="text-xs text-white/40">
                {listening ? 'Toca para enviar' : speaking ? 'Cliente hablando...' : 'Toca el micrófono para hablar'}
              </p>
              <p className="text-[10px] text-white/20 mt-0.5">
                O escribe <span className="text-cenit-gold/40">EVALUAME</span> para evaluar
              </p>
            </div>

            {/* Stop speaking */}
            {speaking && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); }}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:border-cenit-gold/40 transition-colors"
                title="Interrumpir al cliente"
              >
                <VolumeX size={14} className="text-white/60" />
              </motion.button>
            )}
          </div>

          {/* Text input as fallback */}
          <div className="mt-4">
            <input
              type="text"
              placeholder='Escribe aquí si prefieres no usar micrófono...'
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-cenit-gold/30 transition-colors"
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                  sendMessage((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

