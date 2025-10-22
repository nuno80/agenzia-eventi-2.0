'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Earth from '@/components/ui/globe';
import { SparklesCore } from '@/components/ui/sparkles';
import { Label } from '@/components/ui/label';
import { Check, Loader2, MessageCircle } from 'lucide-react';

export default function ContactUs1() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef(null);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Perform form submission logic here
      console.log('Form submitted:', { name, email, phone, eventType, message });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setName('');
      setEmail('');
      setPhone('');
      setEventType('');
      setMessage('');
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background relative w-full overflow-hidden py-16 md:py-24">
      <div
        className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: `radial-gradient(circle at center, #f59e0b, transparent 70%)`, // amber-500
        }}
      />
      <div
        className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full opacity-10 blur-[100px]"
        style={{
          background: `radial-gradient(circle at center, #f59e0b, transparent 70%)`, // amber-500
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="border-border/40 bg-secondary/20 mx-auto max-w-5xl overflow-hidden rounded-[28px] border shadow-xl backdrop-blur-sm">
          <div className="grid md:grid-cols-2">
            <div className="relative p-6 md:p-10" ref={formRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex w-full gap-2"
              >
                <h2 className="from-foreground to-foreground/80 mb-2 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                  Contact
                </h2>
                <span className="text-primary relative z-10 w-full text-4xl font-bold tracking-tight italic md:text-5xl">
                  Us
                </span>
                <SparklesCore
                  id="tsparticles"
                  background="transparent"
                  minSize={0.6}
                  maxSize={1.4}
                  particleDensity={500}
                  className="absolute inset-0 top-0 h-24 w-full"
                  particleColor="#f59e0b" // amber-500
                />
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >
                <p className="text-lg text-slate-600">
                  Richiedi un Preventivo Gratuito<br />
                  <span className="text-base">Raccontaci del tuo progetto e ti ricontatteremo entro 24 ore</span>
                </p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="name">Nome e Cognome *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mario Rossi"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mario.rossi@azienda.it"
                      required
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Label htmlFor="phone">Telefono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+39 340 123 4567"
                      required
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label htmlFor="eventType">Tipo di Evento *</Label>
                    <select
                      id="eventType"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      required
                      className="flex h-9 w-full min-w-0 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white"
                    >
                      <option value="">Seleziona...</option>
                      <option value="congresso">Congresso / Convention</option>
                      <option value="corporate">Evento Aziendale</option>
                      <option value="hostess">Servizio Hostess/Promoter</option>
                      <option value="formazione">Corso di Formazione</option>
                      <option value="ibrido">Evento Ibrido/Online</option>
                      <option value="altro">Altro</option>
                    </select>
                  </motion.div>
                </div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Label htmlFor="message">Messaggio</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Raccontaci brevemente del tuo progetto: data prevista, numero partecipanti, budget orientativo..."
                    rows={4}
                    className="h-40 resize-none"
                  />
                </motion.div>

                <div className="w-full">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 bg-linear-to-b from-rose-500 to-rose-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </span>
                          ) : isSubmitted ? (
                            <span className="flex items-center justify-center">
                              <Check className="mr-2 h-4 w-4" />
                              Message Sent!
                            </span>
                          ) : (
                            <span>Send Email</span>
                          )}
                        </button>
                      </motion.div>
                    </div>
                    
                    <div className="flex-1">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const whatsappMessage = `Ciao! Sono ${name}. Interessato a: ${eventType}. Email: ${email}, Tel: ${phone}. Messaggio: ${message}`;
                            window.open(`https://wa.me/393401234567?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                          }}
                          className="w-full h-14 bg-linear-to-b from-rose-500 to-rose-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Send via WhatsApp
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.form>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative my-8 flex items-center justify-center overflow-hidden pr-8"
            >
              <div className="flex flex-col items-center justify-center overflow-hidden">
                <article className="relative mx-auto h-[350px] min-h-60 max-w-[450px] overflow-hidden rounded-3xl border bg-gradient-to-b from-[#e60a64] to-[#e60a64]/5 p-6 text-3xl tracking-tight text-white md:h-[450px] md:min-h-80 md:p-8 md:text-4xl md:leading-[1.05] lg:text-5xl">
                  Richiedi un Preventivo Gratuito<br />
                  <span className="text-2xl">Raccontaci del tuo progetto e ti ricontatteremo entro 24 ore</span>
                  <div className="absolute -right-20 -bottom-20 z-10 mx-auto flex h-full w-full max-w-[300px] items-center justify-center transition-all duration-700 hover:scale-105 md:-right-28 md:-bottom-28 md:max-w-[550px]">
                    <Earth
                      scale={1.1}
                      baseColor={[1, 0, 0.3]}
                      markerColor={[0, 0, 0]}
                      glowColor={[1, 0.3, 0.4]}
                    />
                  </div>
                </article>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
