/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Clock, Smartphone, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen font-sans selection:bg-cenit-gold/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cenit-black/80 backdrop-blur-md border-b border-cenit-gold/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://lh3.googleusercontent.com/d/1avsFhcrTBMUkVwriSIZQ2sXsaguaL6O_" 
              alt="Cenit Financial Group Logo" 
              className="h-12 w-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          <a 
            href="tel:+1000000000" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-cenit-gold text-cenit-gold hover:bg-cenit-gold hover:text-cenit-black transition-all duration-300 text-sm font-semibold"
          >
            <Phone size={16} />
            <span>Llamar Ahora</span>
          </a>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Accents */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-cenit-gold/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-cenit-gold/5 rounded-full blur-[100px]" />

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Protege tu legado con la <span className="text-cenit-gold">autoridad</span> de Cenit Financial Group
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-10">
                Asesoría de élite en Seguros de Vida y Salud diseñada para quienes no dejan nada al azar.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openModal}
                className="bg-cenit-gold-light text-cenit-black font-bold px-10 py-5 rounded-2xl text-lg md:text-xl shadow-xl shadow-cenit-gold/20 hover:bg-cenit-gold transition-all duration-300 uppercase tracking-wide"
              >
                Obtener Diagnóstico de Protección
              </motion.button>

              <div className="flex items-center gap-8 mt-16">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-cenit-gold">Líderes</span>
                  <span className="text-xs uppercase tracking-widest text-white/40">En Apoyo a Familias Hispanas</span>
                </div>
                <div className="w-px h-10 bg-cenit-gold/20" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-cenit-gold">5k+</span>
                  <span className="text-xs uppercase tracking-widest text-white/40">Familias Protegidas</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative group"
            >
              {/* Image Container with Gold Border and Dark Filter */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-cenit-gold shadow-[0_0_50px_rgba(201,168,76,0.15)] aspect-[4/3] lg:aspect-square">
                <img 
                  src="https://lh3.googleusercontent.com/d/1rICpDBrwP2IpsWKv5IU1GgkWVpyNy_VE" 
                  alt="Familia Cenit Financial Group" 
                  className="w-full h-full object-cover grayscale-[20%] brightness-[60%] group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-cenit-black via-transparent to-transparent opacity-60" />
                
                {/* Visual Accent */}
                <div className="absolute inset-0 border-[20px] border-cenit-black/20 pointer-events-none" />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-cenit-black border border-cenit-gold p-4 rounded-xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cenit-gold/20 flex items-center justify-center">
                    <Shield className="text-cenit-gold" size={20} />
                  </div>
                  <span className="text-sm font-semibold text-white/90">Respaldo de Élite</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-24 bg-cenit-black relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">¿Para quién es <span className="text-cenit-gold">Cenit Financial Group</span>?</h2>
              <p className="text-white/50 max-w-2xl mx-auto">Soluciones diseñadas para perfiles que exigen excelencia y seguridad absoluta.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Perfil A */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white/[0.03] border border-cenit-gold/20 p-10 rounded-3xl relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield size={120} className="text-cenit-gold" />
                </div>
                <span className="inline-block px-4 py-1 rounded-full bg-cenit-gold/10 text-cenit-gold text-[10px] uppercase tracking-widest font-bold mb-6">Perfil A</span>
                <h3 className="text-2xl font-bold mb-4">Familias</h3>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Buscando <span className="text-white font-semibold">blindaje patrimonial</span> a través de seguros de Vida de alto nivel. Protege el futuro de quienes más amas con estructuras financieras sólidas.
                </p>
                <button onClick={openModal} className="text-cenit-gold font-bold flex items-center gap-2 group-hover:gap-4 transition-all uppercase text-sm tracking-widest">
                  Solicitar Blindaje <span className="text-xl">→</span>
                </button>
              </motion.div>

              {/* Perfil B */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white/[0.03] border border-cenit-gold/20 p-10 rounded-3xl relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Smartphone size={120} className="text-cenit-gold" />
                </div>
                <span className="inline-block px-4 py-1 rounded-full bg-cenit-gold/10 text-cenit-gold text-[10px] uppercase tracking-widest font-bold mb-6">Perfil B</span>
                <h3 className="text-2xl font-bold mb-4">Profesionales</h3>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Buscando <span className="text-white font-semibold">cobertura global</span> y acceso a la mejor medicina privada del mundo. Salud sin fronteras para líderes y ejecutivos internacionales.
                </p>
                <button onClick={openModal} className="text-cenit-gold font-bold flex items-center gap-2 group-hover:gap-4 transition-all uppercase text-sm tracking-widest">
                  Solicitar Cobertura <span className="text-xl">→</span>
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Authority Section */}
        <section className="py-24 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-cenit-gold/10 flex items-center justify-center mb-6 group-hover:bg-cenit-gold/20 transition-colors">
                  <Shield className="text-cenit-gold" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">Respaldo Financiero</h3>
                <p className="text-white/60 leading-relaxed">
                  Garantizamos la estabilidad de tu patrimonio con las instituciones más sólidas del mercado.
                </p>
              </motion.div>

              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-cenit-gold/10 flex items-center justify-center mb-6 group-hover:bg-cenit-gold/20 transition-colors">
                  <Clock className="text-cenit-gold" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">Atención Exclusiva 24/7</h3>
                <p className="text-white/60 leading-relaxed">
                  Un equipo de expertos siempre disponible para atender tus necesidades en cualquier momento.
                </p>
              </motion.div>

              <motion.div 
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-cenit-gold/10 flex items-center justify-center mb-6 group-hover:bg-cenit-gold/20 transition-colors">
                  <Smartphone className="text-cenit-gold" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestión de Pólizas Digital</h3>
                <p className="text-white/60 leading-relaxed">
                  Control total de tus coberturas desde cualquier dispositivo con nuestra plataforma avanzada.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Static Contact Form Section */}
        <section id="contacto" className="py-24 bg-cenit-black relative overflow-hidden border-t border-cenit-gold/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cenit-gold/5 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Inicia tu <span className="text-cenit-gold">Blindaje</span> Hoy</h2>
              <p className="text-white/50">Déjanos tus datos y un especialista senior se pondrá en contacto contigo para una sesión estratégica.</p>
            </div>

            <div className="bg-white/[0.02] border border-cenit-gold/20 p-4 md:p-8 rounded-3xl shadow-2xl overflow-hidden">
              <div className="w-full min-h-[500px]">
                <iframe
                  src="https://api.leadconnectorhq.com/widget/form/yLMDV8ab0z1V2wRgNnJT"
                  style={{ width: '100%', height: '600px', border: 'none' }}
                  id="inline-footer-yLMDV8ab0z1V2wRgNnJT"
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-form-name="Formulario de Registro"
                  data-contact-fields="{'first_name':'First Name','last_name':'Last Name','email':'Email','phone':'Phone'}"
                  title="Formulario de Registro"
                ></iframe>
                <script src="https://link.msgsndr.com/js/form_embed.js"></script>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center">
              <img 
                src="https://lh3.googleusercontent.com/d/1avsFhcrTBMUkVwriSIZQ2sXsaguaL6O_" 
                alt="Cenit Financial Group Logo" 
                className="h-10 w-auto opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-white/30">
              © {currentYear} Cenit Financial Group. Todos los derechos reservados.
            </p>
          </div>
          
          <div className="flex items-center gap-8 text-xs uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-cenit-gold transition-colors">Aviso Legal</a>
            <a href="#" className="hover:text-cenit-gold transition-colors">Privacidad</a>
            <a href="#" className="hover:text-cenit-gold transition-colors">Cookies</a>
          </div>
        </div>
      </footer>

      {/* Form Pop-up (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-cenit-black/90 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-cenit-black border-2 border-cenit-gold p-8 md:p-12 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 text-white/50 hover:text-cenit-gold transition-colors"
              >
                <X size={24} />
              </button>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2 text-center">Diagnóstico de Protección</h2>
                <p className="text-white/50 text-center mb-8">Completa tus datos para recibir una asesoría personalizada de élite.</p>
                
                <div className="w-full min-h-[500px] bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/yLMDV8ab0z1V2wRgNnJT"
                    style={{ width: '100%', height: '600px', border: 'none' }}
                    id="inline-yLMDV8ab0z1V2wRgNnJT"
                    data-layout="{'id':'INLINE'}"
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-form-name="Formulario de Registro"
                    data-contact-fields="{'first_name':'First Name','last_name':'Last Name','email':'Email','phone':'Phone'}"
                    title="Formulario de Registro"
                  ></iframe>
                  <script src="https://link.msgsndr.com/js/form_embed.js"></script>
                </div>
              </div>

              {/* Background Accent in Modal */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cenit-gold/5 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
