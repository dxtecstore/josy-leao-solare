import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { Camera, Menu, MessageCircle, X } from 'lucide-react';

const whatsappNumber = '5591986302070';
const instagramUrl = 'https://www.instagram.com/josyleaosolare/';

const siteContent = {
  brand: 'Josy Leao Solare',
  logo: '/brand/josy-logo-official.webp',
  heroBackground: '/brand/glow-01.jpg',
  heroKicker: 'Josy Leao Solare',
  heroTitle: 'Vista Solare.',
  heroSubtitle: 'Bronzeamento premium, estetica e autoestima em cada detalhe.',
  catalogTitle: 'Experiencias',
  catalogEmphasis: 'Selecionadas.',
  aboutTitle: 'Uma pele.',
  aboutEmphasis: 'Uma presenca.',
  aboutCopy:
    'A Josy Leao Solare une bronzeamento artificial, estetica e uma experiencia de cuidado para quem deseja se sentir mais bonita, confiante e iluminada.',
  address: 'Av. Alcindo Cacela, 1474 - Nazare - Belem/PA',
};

const navItems = [
  { label: 'Catalogo', href: '#catalogo' },
  { label: 'Experiencia', href: '#experiencia' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'WhatsApp', href: '#agendamento' },
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

const catalog = [
  {
    title: 'Glow Solare',
    detail: 'Bronze iluminado com acabamento premium.',
    image: '/brand/glow-01.jpg',
  },
  {
    title: 'Pele Dourada',
    detail: 'Resultado real direto do estudio.',
    image: '/brand/resultado-real-01.jpg',
  },
  {
    title: 'Marquinha Premium',
    detail: 'Design de bronze e contorno personalizado.',
    image: '/brand/resultado-real-02.jpg',
  },
  {
    title: 'Banho de Lua',
    detail: 'Ritual de pele, brilho e cuidado.',
    image: '/brand/banho-lua-01.jpg',
  },
  {
    title: 'Bronze com Fita',
    detail: 'Marquinha desenhada com precisao.',
    image: '/brand/marquinha-01.jpg',
  },
  {
    title: 'Verao Permanente',
    detail: 'Autoestima elevada em cada detalhe.',
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
    <div className="site-shell min-h-screen bg-black text-white">
      <header className="topbar">
        <a href="#hero" className="brand-name" aria-label="Josy Leao Solare">
          Josy Leao Solare
        </a>

        <nav className="desktop-nav">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="insta-link" href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
          <Camera size={20} />
        </a>

        <button className="menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsMenuOpen((value) => !value)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {isMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        <section id="hero" className="hero-frame">
          <div className="hero-media" aria-hidden="true">
            <img src={siteContent.heroBackground} alt="" />
          </div>
          <div className="hero-text">
            <img src={siteContent.logo} alt="Josy Leao Solare" />
            <span>{siteContent.heroKicker}</span>
            <h1>{siteContent.heroTitle}</h1>
            <p>{siteContent.heroSubtitle}</p>
            <div>
              <a className="gold-button" href="#catalogo">
                Ver experiencias
              </a>
              <a className="outline-button" href={quickMessage} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="scroll-indicator" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <span>Josy Leao Solare</span>
          <b />
          <span>Bronzeamento Premium</span>
          <b />
          <span>Resultados Reais</span>
          <b />
          <span>Belem 2026</span>
          <b />
          <span>Luxo Dourado</span>
        </div>

        <section id="catalogo" className="catalog-section">
          <p className="section-kicker">Catalogo</p>
          <h2>
            {siteContent.catalogTitle} <em>{siteContent.catalogEmphasis}</em>
          </h2>

          <div className="product-grid">
            {catalog.map((item) => (
              <article className="product-card" key={item.title}>
                <div className="product-image">
                  <img src={item.image} alt={`${item.title} Josy Leao Solare`} loading="lazy" />
                </div>
                <div className="product-info">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                  <span>Agendar pelo WhatsApp</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experiencia" className="about-band">
          <p className="section-kicker">Experiencia</p>
          <h2>
            {siteContent.aboutTitle} <em>{siteContent.aboutEmphasis}</em>
          </h2>
          <p>{siteContent.aboutCopy}</p>
          <div className="about-actions">
            <a className="gold-button" href={quickMessage} target="_blank" rel="noreferrer">
              Falar no WhatsApp
            </a>
            <a className="outline-button" href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </section>

        <section id="agendamento" className="booking-band">
          <p className="section-kicker">Agendamento</p>
          <h2>
            Escolha seu <em>ritual.</em>
          </h2>

          <form className="booking-form" onSubmit={handleSubmit}>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome" />
            <select value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
              {services.map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
            <select value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })}>
              <option>Manha</option>
              <option>Tarde</option>
              <option>Noite</option>
            </select>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Observacoes" />
            <button className="gold-button" type="submit">
              Gerar mensagem
            </button>
          </form>
        </section>

        <section id="sobre" className="location-band">
          <p className="section-kicker">Localizacao</p>
          <h2>{siteContent.address}</h2>
          <a className="outline-button" href="https://www.google.com/maps/search/?api=1&query=Av.%20Alcindo%20Cacela%201474%20Nazare%20Belem%20PA" target="_blank" rel="noreferrer">
            Abrir mapa
          </a>
        </section>
      </main>

      <footer className="footer">
        <div>
          <h3>Josy Leao Solare</h3>
          <p>Centro de Bronzeamento e Estetica.</p>
        </div>
        <div>
          <h4>Navegacao</h4>
          <a href="#catalogo">Catalogo</a>
          <a href="#experiencia">Experiencia</a>
          <a href="#agendamento">Agenda</a>
        </div>
        <div>
          <h4>Contato</h4>
          <a href={quickMessage} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={instagramUrl} target="_blank" rel="noreferrer">@josyleaosolare</a>
        </div>
      </footer>

      <a className="float-whatsapp" href={quickMessage} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

export default App;
