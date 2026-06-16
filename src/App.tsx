import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock,
  Gem,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

const whatsappNumber = '5591986302070';
const instagramUrl = 'https://www.instagram.com/josyleaosolare/';

const navItems = [
  { label: 'Marca', href: '#marca' },
  { label: 'Reinauguracao', href: '#reinauguracao' },
  { label: 'Servicos', href: '#servicos' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Agendar', href: '#agendamento' },
];

const services = [
  'Bronzeamento Natural',
  'Bronzeamento com Fita',
  'Marquinha Personalizada',
  'Estetica Corporal',
  'Estetica Facial',
  'Micropigmentacao',
  'Design de Sobrancelhas',
  'Procedimentos Premium',
];

const gallery = [
  {
    title: 'Resultado real',
    tag: 'Bronze no estúdio',
    image: '/brand/resultado-real-01.jpg',
  },
  {
    title: 'Marquinha personalizada',
    tag: 'Pele dourada',
    image: '/brand/resultado-real-02.jpg',
  },
  {
    title: 'Glow Solare',
    tag: 'Presença premium',
    image: '/brand/glow-01.jpg',
  },
  {
    title: 'Banho de lua',
    tag: 'Cuidado com a pele',
    image: '/brand/banho-lua-01.jpg',
  },
  {
    title: 'Bronze com fita',
    tag: 'Design de biquíni',
    image: '/brand/marquinha-01.jpg',
  },
  {
    title: 'Verão o ano inteiro',
    tag: 'Autoestima renovada',
    image: '/brand/verao-01.jpg',
  },
];

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    service: services[0],
    date: '',
    period: 'Manha',
    notes: '',
  });

  const quickMessage = useMemo(
    () =>
      buildWhatsAppUrl(
        'Ola, Josy Leao Solare! Quero agendar uma experiencia premium de beleza e bronzeamento.',
      ),
    [],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = [
      'Ola, Josy Leao Solare! Quero agendar meu atendimento.',
      `Nome: ${form.name || 'Nao informado'}`,
      `Servico: ${form.service}`,
      `Data desejada: ${form.date || 'A combinar'}`,
      `Periodo: ${form.period}`,
      form.notes ? `Observacoes: ${form.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="luxury-orbit" aria-hidden="true" />
      <div className="gold-particles" aria-hidden="true" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#hero" className="group flex items-center gap-3" aria-label="Josy Leao Solare">
            <span className="brand-mark">
              <img src="/brand/josy-logo-official-small.webp" alt="" />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-xl text-white">Josy Leao Solare</span>
              <span className="block text-xs uppercase tracking-[0.28em] text-champagne/80">Bronzeamento artificial</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <a className="hidden items-center gap-2 border border-gold/50 bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:bg-champagne lg:inline-flex" href={quickMessage} target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            WhatsApp
          </a>

          <button
            className="grid h-11 w-11 place-items-center border border-white/15 text-white lg:hidden"
            type="button"
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/10 bg-black px-5 py-5 lg:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm uppercase tracking-[0.2em] text-white/80" onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="hero" className="relative isolate flex min-h-screen items-center pt-24">
          <div className="gold-wave wave-one" aria-hidden="true" />
          <div className="gold-wave wave-two" aria-hidden="true" />

          <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="max-w-3xl">
              <img className="hero-logo" src="/brand/josy-logo-official.webp" alt="Josy Leao Solare Centro de Bronzeamento Artificial" />
              <div className="mb-6 inline-flex items-center gap-3 border border-gold/35 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-champagne">
                <Sparkles size={16} />
                Reinauguracao premium em Belem
              </div>
              <h1 className="font-serif text-6xl leading-[0.92] text-white sm:text-7xl lg:text-8xl">
                Josy Leao Solare
              </h1>
              <p className="mt-5 text-xl uppercase tracking-[0.22em] text-gold sm:text-2xl">
                Centro de Bronzeamento e Estetica
              </p>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">
                Sua nova experiencia em beleza, bronzeamento e autoestima.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a className="premium-button" href="#agendamento">
                  Agendar experiencia
                  <ArrowRight size={18} />
                </a>
                <a className="secondary-button" href="#servicos">
                  Ver servicos
                  <ChevronRight size={18} />
                </a>
              </div>
            </div>

            <div className="hero-visual" aria-label="Resultado real Josy Leao Solare">
              <div className="hero-frame">
                <img className="hero-photo" src="/brand/glow-01.jpg" alt="Resultado real de bronzeamento Josy Leao Solare" />
                <div className="hero-photo-glow" aria-hidden="true" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-sm uppercase tracking-[0.3em] text-champagne/80">Resultado real</p>
                  <p className="mt-3 font-serif text-4xl text-white">Glow de estúdio, pele de presença.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="marca" className="section-band">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow">Storytelling da marca</p>
              <h2 className="section-title">Um novo capitulo para quem busca pele iluminada, autocuidado e presenca.</h2>
            </div>
            <div className="space-y-8">
              <p className="section-copy">
                A Josy Leao Solare nasce com uma proposta refinada: unir bronzeamento, estetica e experiencia sensorial em um ambiente de cuidado, elegancia e resultado. Cada detalhe prepara a cliente para se sentir confiante antes, durante e depois do atendimento.
              </p>
              <div className="proof-strip">
                <span>12.7K seguidores</span>
                <span>Resultados reais</span>
                <span>Bronze, estética e autoestima</span>
              </div>
            </div>
          </div>
        </section>

        <section id="reinauguracao" className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="reinauguracao-panel">
              <div>
                <p className="eyebrow">Reinauguracao</p>
                <h2 className="section-title">Novo espaco, nova energia, o mesmo compromisso com beleza premium.</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                {['Atendimento sofisticado', 'Protocolos selecionados', 'Experiencia comercial pronta'].map((item) => (
                  <div key={item} className="metric-box">
                    <Star className="text-gold" size={20} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="servicos" className="section-band">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow">Servicos</p>
                <h2 className="section-title max-w-3xl">Tratamentos para realcar bronze, contorno, pele e expressao.</h2>
              </div>
              <a className="secondary-button w-fit" href="#agendamento">
                Consultar horarios
                <CalendarDays size={18} />
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <article key={service} className="service-card">
                  <Gem size={24} className="text-gold" />
                  <h3>{service}</h3>
                  <p>Protocolo preparado para uma entrega elegante, segura e memoravel.</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="resultados" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-12">
              <p className="eyebrow">Resultados reais</p>
              <h2 className="section-title max-w-3xl">Provas reais do bronze, da marquinha e da experiencia Solare.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <div key={item.title} className="gallery-tile">
                  <img src={item.image} alt={`${item.title} Josy Leao Solare`} loading="lazy" />
                  <span>{item.tag}</span>
                  <strong>{item.title}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-band">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Parceria</p>
              <h2 className="section-title">Josy Leao Solare + Yasmin Manito</h2>
            </div>
            <p className="section-copy">
              Uma colaboracao pensada para fortalecer posicionamento, imagem e desejo. A parceria conecta tecnica, presenca digital e uma narrativa premium para apresentar a reinauguracao com impacto comercial.
            </p>
          </div>
        </section>

        <section id="agendamento" className="py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="eyebrow">Agendamento via WhatsApp</p>
              <h2 className="section-title">Escolha o servico e envie sua mensagem pronta.</h2>
              <p className="section-copy mt-6">
                O formulario organiza o pedido e abre o WhatsApp com todas as informacoes para a equipe confirmar disponibilidade.
              </p>
              <div className="mt-8 space-y-4 text-white/75">
                <p className="flex items-center gap-3"><Clock className="text-gold" size={20} /> Atendimento com horario confirmado pela equipe.</p>
                <p className="flex items-center gap-3"><Phone className="text-gold" size={20} /> Botao flutuante sempre disponivel.</p>
              </div>
            </div>

            <form className="booking-form" onSubmit={handleSubmit}>
              <label>
                Nome
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Seu nome" />
              </label>
              <label>
                Servico
                <select value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
                  {services.map((service) => (
                    <option key={service}>{service}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  Data desejada
                  <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                </label>
                <label>
                  Periodo
                  <select value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })}>
                    <option>Manha</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                  </select>
                </label>
              </div>
              <label>
                Observacoes
                <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Conte se deseja bronze, estetica ou uma avaliacao personalizada." />
              </label>
              <button className="premium-button justify-center" type="submit">
                Gerar mensagem no WhatsApp
                <MessageCircle size={18} />
              </button>
            </form>
          </div>
        </section>

        <section id="localizacao" className="section-band">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Localizacao</p>
              <h2 className="section-title">Av. Alcindo Cacela, 1474 - Nazare - Belem/PA</h2>
              <a className="secondary-button mt-8 w-fit" href="https://www.google.com/maps/search/?api=1&query=Av.%20Alcindo%20Cacela%201474%20Nazare%20Belem%20PA" target="_blank" rel="noreferrer">
                Abrir mapa
                <MapPin size={18} />
              </a>
            </div>
            <div className="map-placeholder">
              <MapPin size={40} />
              <span>Mapa e fachada podem ser inseridos aqui</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 text-sm text-white/60 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <img className="footer-logo" src="/brand/josy-logo-official-small.webp" alt="Josy Leao Solare" />
          <p>Centro de Bronzeamento e Estetica - Belem/PA</p>
          <a className="inline-flex items-center gap-2 text-gold" href={instagramUrl} target="_blank" rel="noreferrer">
            <Camera size={18} />
            Instagram
          </a>
        </div>
      </footer>

      <a className="floating-whatsapp" href={quickMessage} target="_blank" rel="noreferrer" aria-label="Agendar pelo WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

export default App;
