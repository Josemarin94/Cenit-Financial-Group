import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Volume2, VolumeX, PhoneOff, Phone, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = { role: 'user' | 'assistant'; content: string };

const getVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('male'))
    || voices.find(v => v.lang.startsWith('es-US'))
    || voices.find(v => v.lang.startsWith('es'))
    || null;
};

export default function Simulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [micActive, setMicActive] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const messagesRef = useRef<Message[]>([]);
  const loadingRef = useRef(false);
  const speakingRef = useRef(false);
  messagesRef.current = messages;
  loadingRef.current = loading;
  speakingRef.current = speaking;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, transcript]);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.cancel();
      recognitionRef.current?.abort();
    };
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    window.speechSynthesis.cancel();
    if (!voiceEnabled) { onDone?.(); return; }
    const clean = text.replace(/[*_#•→←]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(clean);
    const voice = getVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 0.85;
    utterance.volume = 1;
    utterance.onstart = () => { setSpeaking(true); speakingRef.current = true; };
    utterance.onend = () => { setSpeaking(false); speakingRef.current = false; onDone?.(); };
    utterance.onerror = () => { setSpeaking(false); speakingRef.current = false; onDone?.(); };
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || loadingRef.current) return;
    const current = messagesRef.current;
    const newMessages: Message[] = [...current, { role: 'user', content: userText }];
    setMessages(newMessages);
    setTranscript('');
    setLoading(true);
    window.speechSynthesis.cancel();
    setSpeaking(false);
    speakingRef.current = false;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      const reply = data.reply || 'Error al responder.';
      const updated: Message[] = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(updated);
      setLoading(false);
      // Speak then re-enable mic listening
      speak(reply, () => {
        speakingRef.current = false;
      });
      const lower = reply.toLowerCase();
      if (lower.includes('que tengas buen dia') || lower.includes('cuelga') || lower.includes('llamada terminada')) {
        setCallEnded(true);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Error de conexión.' }]);
      setLoading(false);
    }
  }, [speak]);

  // Start continuous mic — restarts automatically after each phrase
  const startContinuousMic = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'es-ES';
    recognition.continuous = false; // false = auto-detects end of speech
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onstart = () => setMicActive(true);

    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      finalText += final;
      setTranscript((finalText + interim).trim());
    };

    recognition.onend = () => {
      // If we have text and not loading/speaking, send it
      if (finalText.trim() && !loadingRef.current) {
        sendMessage(finalText.trim());
        finalText = '';
      } else {
        finalText = '';
        setTranscript('');
      }
      // Restart mic automatically unless call ended
      setTimeout(() => {
        if (!loadingRef.current) {
          startContinuousMic();
        } else {
          // Wait for loading to finish then restart
          const wait = setInterval(() => {
            if (!loadingRef.current && !speakingRef.current) {
              clearInterval(wait);
              startContinuousMic();
            }
          }, 500);
        }
      }, 300);
    };

    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech' || e.error === 'aborted') {
        // Just restart silently
        return;
      }
      setMicActive(false);
    };

    try { recognition.start(); } catch { }
  }, [sendMessage]);

  const startSimulation = async () => {
    setStarted(true);
    setCallEnded(false);
    setMessages([]);
    setLoading(true);
    setTranscript('');
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
      setLoading(false);
      speak(reply, () => {
        // Start mic after client finishes speaking
        startContinuousMic();
      });
    } catch {
      setMessages([...initMsg, { role: 'assistant', content: 'Error de conexión.' }]);
      setLoading(false);
    }
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setMessages([]);
    setStarted(false);
    setCallEnded(false);
    setTranscript('');
    setMicActive(false);
    setSpeaking(false);
    setTextInput('');
    setLoading(false);
  };

  const isEval = messages.some(m => m.role === 'user' && m.content.toUpperCase().includes('EVALUAME'));

  return (
    <div className="flex flex-col bg-white/[0.02] border border-cenit-gold/20 rounded-3xl overflow-hidden shadow-2xl"
      style={{ height: 'min(700px, 92vh)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-cenit-gold/10 bg-cenit-gold/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
            !started ? 'bg-white/20'
            : callEnded ? 'bg-red-400'
            : speaking ? 'bg-cenit-gold animate-pulse'
            : loading ? 'bg-yellow-400 animate-pulse'
            : micActive ? 'bg-green-400 animate-pulse'
            : 'bg-green-400'
          }`} />
          <span className="font-semibold text-cenit-gold text-xs uppercase tracking-widest">
            {!started ? 'Simulador Listo'
              : callEnded ? 'Llamada Terminada'
              : speaking ? '🔊 Cliente hablando...'
              : loading ? '⏳ Procesando...'
              : micActive ? '🎙️ Micrófono activo — habla cuando quieras'
              : 'Conectando micrófono...'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {started && (
            <button onClick={() => { setVoiceEnabled(v => !v); window.speechSynthesis.cancel(); setSpeaking(false); }}
              className="text-white/40 hover:text-cenit-gold transition-colors">
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          )}
          {started && (
            <button onClick={reset} className="flex items-center gap-1.5 text-white/40 hover:text-cenit-gold transition-colors text-xs">
              <RefreshCw size={12} /> Nueva
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        <AnimatePresence>
          {!started ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center gap-5 py-8">
              <div className="w-20 h-20 rounded-full bg-cenit-gold/10 border border-cenit-gold/20 flex items-center justify-center">
                <Phone size={32} className="text-cenit-gold" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{fontFamily:'serif'}}>
                  Simulador de <span className="text-cenit-gold">Llamadas</span>
                </h3>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                  El micrófono se activa automáticamente. Habla cuando quieras, como en una llamada real.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-sm w-full">
                {[
                  { icon: '🎙️', text: 'Micrófono siempre abierto' },
                  { icon: '🤖', text: 'Cliente detecta pausas' },
                  { icon: '📊', text: 'Di EVALUAME al final' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.03] border border-cenit-gold/10 rounded-xl p-3">
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="text-[10px] text-white/40 leading-tight">{item.text}</div>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={startSimulation}
                className="bg-cenit-gold text-cenit-black font-bold px-10 py-4 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-cenit-gold/20 flex items-center gap-2">
                <Phone size={16} /> Iniciar Llamada
              </motion.button>
              <p className="text-white/20 text-xs">Permite el acceso al micrófono cuando el navegador lo solicite</p>
            </motion.div>
          ) : (
            <>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-cenit-gold/10 border border-cenit-gold/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <span className="text-cenit-gold text-xs font-bold">C</span>
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-cenit-gold text-cenit-black font-medium rounded-br-sm'
                      : 'bg-white/[0.05] border border-white/10 text-white/90 rounded-bl-sm'
                  }`}>
                    {m.role === 'assistant' && <span className="text-[10px] text-cenit-gold/60 font-bold block mb-1 uppercase tracking-wider">Cliente</span>}
                    {m.role === 'user' && <span className="text-[10px] text-cenit-black/50 font-bold block mb-1 uppercase tracking-wider">Agente</span>}
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {transcript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm bg-green-500/10 border border-green-500/20 text-white/60 italic rounded-br-sm">
                    <span className="text-[10px] text-green-400/60 font-bold block mb-1 uppercase tracking-wider">🎙️ Hablando...</span>
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
                    <span className="text-white/30 text-xs">respondiendo...</span>
                  </div>
                </motion.div>
              )}

              {callEnded && !isEval && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center py-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <PhoneOff size={12} /> El cliente colgó — di "EVALUAME" para ver tu puntuación
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar — solo texto como fallback */}
      {started && (
        <div className="px-4 md:px-6 py-3 border-t border-cenit-gold/10 bg-cenit-black/60 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            {/* Mic indicator */}
            <div className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border transition-colors ${
              speaking ? 'border-cenit-gold/30 bg-cenit-gold/5'
              : loading ? 'border-yellow-500/20 bg-yellow-500/5'
              : micActive ? 'border-green-500/20 bg-green-500/5'
              : 'border-white/5 bg-white/[0.02]'
            }`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                speaking ? 'bg-cenit-gold animate-pulse'
                : loading ? 'bg-yellow-400 animate-pulse'
                : micActive ? 'bg-green-400 animate-pulse'
                : 'bg-white/20'
              }`} />
              <span className="text-xs text-white/30">
                {speaking ? 'Cliente hablando — espera tu turno'
                  : loading ? 'Procesando respuesta...'
                  : micActive ? 'Micrófono abierto — habla cuando quieras'
                  : 'Iniciando micrófono...'}
              </span>
            </div>

            {speaking && (
              <button onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); speakingRef.current = false; }}
                className="px-3 py-2 rounded-xl border border-white/10 text-white/30 hover:text-cenit-gold hover:border-cenit-gold/30 transition-colors text-xs flex-shrink-0">
                Interrumpir
              </button>
            )}
          </div>

          {/* Text fallback */}
          <div className="flex gap-2">
            <input type="text" value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(textInput)}
              placeholder="Escribe si prefieres no usar micrófono..."
              className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white/50 placeholder-white/15 focus:outline-none focus:border-cenit-gold/20 transition-colors" />
            <button onClick={() => sendMessage(textInput)}
              disabled={loading || !textInput.trim()}
              className="w-9 h-9 rounded-xl bg-cenit-gold/10 border border-cenit-gold/20 flex items-center justify-center hover:bg-cenit-gold/20 transition-colors disabled:opacity-20">
              <Send size={12} className="text-cenit-gold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
