import type { FormEvent, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  Heart,
  ImageUp,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  supabase,
  type Appointment,
  type ClientProfile,
  type GalleryItem,
  type Service,
  type Settings as BusinessSettings,
  type Testimonial,
  type TimeBlock,
} from './lib/supabase';
import { benefits, fallbackGallery, fallbackServices, fallbackSettings, fallbackTestimonials } from './data/defaults';

const categories = ['Bronze', 'Marquinha', 'Estetica facial', 'Estetica corporal'];
const statusList: Appointment['status'][] = ['novo', 'confirmado', 'realizado', 'cancelado'];
const periods = ['Manha', 'Tarde', 'Noite'];

function money(value?: number | null) {
  return value ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Sob consulta';
}

function buildWhatsAppUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

async function uploadMedia(file: File, folder: string) {
  if (!supabase) throw new Error('Supabase nao configurado.');

  const safeName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase();
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from('josy-media').upload(path, file, { upsert: true });
  if (error) throw error;

  return supabase.storage.from('josy-media').getPublicUrl(path).data.publicUrl;
}

function App() {
  const path = window.location.pathname;

  if (path === '/admin/login') return <AdminLogin />;
  if (path === '/admin/dashboard') return <AdminDashboard />;
  return <LandingPage />;
}

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<BusinessSettings>(fallbackSettings);
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [gallery, setGallery] = useState<GalleryItem[]>(fallbackGallery);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [form, setForm] = useState({
    client_name: '',
    phone: '',
    service_id: fallbackServices[0]?.id ?? '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
  });

  useEffect(() => {
    async function loadPublicData() {
      if (!supabase) return;

      const [settingsResult, servicesResult, galleryResult, testimonialsResult] = await Promise.all([
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('services').select('*').eq('active', true).order('created_at', { ascending: true }),
        supabase.from('gallery').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').eq('active', true).order('created_at', { ascending: false }),
      ]);

      if (settingsResult.data) setSettings(settingsResult.data);
      if (servicesResult.data?.length) {
        setServices(servicesResult.data);
        setForm((current) => ({ ...current, service_id: servicesResult.data[0].id }));
      }
      if (galleryResult.data?.length) setGallery(galleryResult.data);
      if (testimonialsResult.data?.length) setTestimonials(testimonialsResult.data);
    }

    void loadPublicData();
  }, []);

  const selectedService = services.find((service) => service.id === form.service_id) ?? services[0];
  const quickMessage = buildWhatsAppUrl(
    settings.whatsapp,
    'Ola, Josy Leao Solare! Quero viver uma experiencia premium de bronzeamento e autoestima.',
  );
  const procedureModels = (services.length >= 6 ? services : fallbackServices).slice(0, 6);
  const galleryModels = (gallery.length >= 6 ? gallery : fallbackGallery).slice(0, 6);

  async function handleAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = `Ola, tenho interesse em agendar ${selectedService?.name ?? 'um atendimento'} no dia ${form.preferred_date || '[data]'} as ${form.preferred_time || '[hora]'}. Meu nome e ${form.client_name || '[nome]'}.`;

    if (supabase) {
      await supabase.from('appointments').insert({
        client_name: form.client_name,
        phone: form.phone,
        service_id: selectedService?.id,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        status: 'novo',
        notes: form.notes,
      });

      if (form.client_name && form.phone) {
        await supabase.from('clients').upsert(
          {
            name: form.client_name,
            whatsapp: form.phone,
            last_procedure: selectedService?.name ?? null,
            notes: form.notes,
          },
          { onConflict: 'whatsapp' },
        );
      }
    }

    window.open(buildWhatsAppUrl(settings.whatsapp, message), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="solare-page">
      <div className="solare-particles" aria-hidden="true" />
      <header className="lux-nav">
        <a href="/" className="lux-nav-logo" aria-label={settings.business_name}>
          Josy Leao Solare
        </a>
        <nav className="lux-nav-links">
          <a href="#story">Historia</a>
          <a href="#procedimentos">Procedimentos</a>
          <a href="#gallery">Galeria</a>
          <a href="#agendamento">Agenda</a>
          <a href="/admin/login">Admin</a>
        </nav>
        <a className="lux-nav-cta" href="#agendamento">Agendar</a>
        <button className="lux-menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsMenuOpen((value) => !value)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {isMenuOpen && (
          <div className="lux-mobile-menu">
            {[
              ['story', 'Historia'],
              ['procedimentos', 'Procedimentos'],
              ['gallery', 'Galeria'],
              ['agendamento', 'Agenda'],
            ].map(([href, label]) => (
              <a key={href} href={`#${href}`} onClick={() => setIsMenuOpen(false)}>{label}</a>
            ))}
            <a href="/admin/login">Solare Studio OS</a>
          </div>
        )}
      </header>

      <main>
        <section id="hero" className="lux-hero">
          <div className="lux-hero-logo-bg" aria-hidden="true">
            <img src={settings.logo_url || fallbackSettings.logo_url || ''} alt="" />
          </div>
          <div className="lux-hero-content">
            <span className="lux-hero-badge">Centro de Bronzeamento e Estetica</span>
            <h1>
              Sua pele, sua luz, <em>sua melhor versao.</em>
            </h1>
            <div className="lux-hero-line" />
            <p>Bronzeamento premium em Belem do Para com cuidado, marquinha e uma experiencia feminina de autoestima.</p>
            <div className="lux-hero-actions">
              <a className="lux-btn-primary" href="#agendamento">Agendar no WhatsApp</a>
              <a className="lux-btn-secondary" href="#gallery">Ver resultados</a>
            </div>
          </div>
          <div className="lux-hero-scroll" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </section>

        <div className="lux-ticker" aria-hidden="true">
          <div className="lux-ticker-track">
            {Array.from({ length: 2 }).map((_, index) => (
              <div className="lux-ticker-item" key={index}>
                <span>✦</span> Bronzeamento Premium <span>✦</span> Estetica <span>✦</span> Autoestima <span>✦</span> Beleza <span>✦</span> Luxo <span>✦</span> Josy Leao Solare
              </div>
            ))}
          </div>
        </div>

        <section id="story" className="lux-story">
          <div className="lux-story-grid">
            <div className="lux-story-text">
              <p className="lux-eyebrow">Storytelling</p>
              <h2>Cada detalhe pensado para <em>realcar sua beleza.</em></h2>
              <p>Na Josy Leao Solare, o bronzeamento nao e apenas um procedimento. E um ritual de cuidado, confianca, elegancia e autoestima para mulheres que desejam se sentir mais luminosas.</p>
              <p>Cada detalhe do bronze e pensado para realcar sua beleza com naturalidade, seguranca e sofisticacao.</p>
              <strong>Mais que bronzeamento: uma experiencia de autoestima.</strong>
              <div className="lux-stats">
                <span><b>01</b> Atendimento personalizado</span>
                <span><b>02</b> Resultado natural</span>
                <span><b>03</b> Ambiente feminino</span>
                <span><b>04</b> Experiencia premium</span>
              </div>
            </div>
            <div className="lux-story-image">
              <img src="/brand/resultado-real-02.jpg" alt="Resultado premium Josy Leao Solare" />
              <i />
            </div>
          </div>
        </section>

        <section id="procedimentos" className="lux-procedures">
          <div className="lux-section-head">
            <p className="lux-eyebrow">Procedimentos</p>
            <h2>Seis experiencias para <em>pele, corpo e presenca.</em></h2>
          </div>
          <div className="lux-procedure-grid">
            {procedureModels.map((service, index) => (
              <article className="lux-procedure-card" key={service.id}>
                <img src={service.image_url || fallbackSettings.hero_image_url || ''} alt={service.name} loading="lazy" />
                <div>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <small>{money(service.price)} - {service.duration || 'Tempo sob consulta'}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="beneficios" className="lux-benefits">
          <div className="lux-section-head">
            <p className="lux-eyebrow">Destaques do bronze</p>
            <h2>Cuidado feminino com <em>acabamento natural.</em></h2>
          </div>
          <div className="lux-benefit-grid">
            {benefits.map((benefit) => (
              <article key={benefit}>
                <span>✦</span>
                <h3>{benefit}</h3>
                <p>Um detalhe pensado para transformar atendimento em experiencia e resultado em desejo.</p>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="lux-gallery">
          <div className="lux-section-head">
            <p className="lux-eyebrow">Galeria premium</p>
            <h2>Resultados reais com <em>estetica editorial.</em></h2>
          </div>
          <div className="lux-gallery-grid">
            {galleryModels.map((item) => (
              <article key={item.id}>
                <img src={item.image_url} alt={item.title} loading="lazy" />
                <div><span>{item.category}</span><b>{item.title}</b></div>
              </article>
            ))}
          </div>
        </section>

        <section className="lux-testimonials">
          <div className="lux-section-head">
            <p className="lux-eyebrow">Provas reais</p>
            <h2>Clientes que viveram <em>o momento Solare.</em></h2>
          </div>
          <div className="lux-testi-grid">
            {testimonials.map((item) => (
              <blockquote key={item.id}>
                <span>“</span>
                <p>{item.text}</p>
                <cite>{item.client_name}</cite>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="agendamento" className="lux-booking">
          <div className="lux-booking-bg" aria-hidden="true">Solare</div>
          <div className="lux-section-head">
            <p className="lux-eyebrow">Agenda de bronzeamento</p>
            <h2>Reserve seu <em>ritual.</em></h2>
          </div>
          <form className="lux-booking-form" onSubmit={handleAppointment}>
            <input required value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} placeholder="Nome" />
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="WhatsApp" />
            <select value={form.service_id} onChange={(event) => setForm({ ...form, service_id: event.target.value })}>
              {procedureModels.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            <input type="date" value={form.preferred_date} onChange={(event) => setForm({ ...form, preferred_date: event.target.value })} />
            <select value={form.preferred_time} onChange={(event) => setForm({ ...form, preferred_time: event.target.value })}>
              <option value="">Horario desejado</option>
              {periods.map((period) => <option key={period}>{period}</option>)}
            </select>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Observacoes" />
            <button type="submit">Gerar mensagem inteligente</button>
          </form>
        </section>

        <section className="lux-location">
          <p className="lux-eyebrow">Localizacao</p>
          <h2>{settings.address}</h2>
          <a className="lux-btn-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noreferrer">Abrir mapa</a>
        </section>
      </main>

      <footer className="lux-footer">
        <div>
          <h3>Josy Leao Solare</h3>
          <p>Centro de Bronzeamento e Estetica em Belem/PA.</p>
        </div>
        <nav>
          <a href={settings.instagram} target="_blank" rel="noreferrer"><Camera size={16} /> Instagram</a>
          <a href={quickMessage} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
          <a href="/admin/login">Solare Studio OS</a>
        </nav>
      </footer>

      <a className="float-whatsapp" href={quickMessage} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <MessageCircle size={26} />
      </a>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!supabase) {
      window.location.href = '/admin/dashboard';
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      return;
    }

    window.location.href = '/admin/dashboard';
  }

  return (
    <div className="admin-login">
      <form onSubmit={handleLogin}>
        <Lock size={28} />
        <p>Solare Studio OS</p>
        <h1>Gestao premium para bronzeamento e estetica.</h1>
        {!isSupabaseConfigured && <small>Modo demonstracao ativo. Configure o Supabase para salvar dados reais.</small>}
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@studio.com" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" />
        {error && <strong>{error}</strong>}
        <button className="gold-button soft" type="submit">{isSupabaseConfigured ? 'Entrar no sistema' : 'Entrar no Studio OS'}</button>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [gallery, setGallery] = useState<GalleryItem[]>(fallbackGallery);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(fallbackSettings);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    async function bootstrap() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.href = '/admin/login';
        return;
      }
      setSessionReady(true);
      await loadAdminData();
    }
    void bootstrap();
  }, []);

  async function loadAdminData() {
    if (!supabase) return;

    const [servicesResult, galleryResult, appointmentsResult, testimonialsResult, settingsResult, clientsResult, blocksResult] =
      await Promise.all([
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('gallery').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*, services(name, price, duration)').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('time_blocks').select('*').order('block_date', { ascending: true }),
      ]);

    if (servicesResult.data?.length) setServices(servicesResult.data);
    if (galleryResult.data?.length) setGallery(galleryResult.data);
    if (appointmentsResult.data) setAppointments(appointmentsResult.data as Appointment[]);
    if (testimonialsResult.data?.length) setTestimonials(testimonialsResult.data);
    if (settingsResult.data) setSettings(settingsResult.data);
    if (clientsResult.data) setClients(clientsResult.data);
    if (blocksResult.data) setBlocks(blocksResult.data);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  if (!sessionReady) return <div className="admin-loading">Carregando Solare Studio OS...</div>;

  const today = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments.filter((appointment) => appointment.preferred_date === today);
  const weekClients = clients.filter((client) => Date.now() - new Date(client.created_at).getTime() < 7 * 24 * 60 * 60 * 1000);
  const estimatedRevenue = appointments
    .filter((appointment) => appointment.status !== 'cancelado')
    .reduce((sum, appointment) => sum + Number(appointment.services?.price ?? 0), 0);
  const topService = services[0]?.name ?? 'Bronzeamento';

  return (
    <div className="studio-os">
      <aside className="studio-sidebar">
        <div>
          <p>Solare Studio OS</p>
          <h1>Josy Leao Solare</h1>
        </div>
        {[
          ['dashboard', LayoutDashboard, 'Dashboard'],
          ['agenda', CalendarDays, 'Agenda Inteligente'],
          ['crm', Users, 'CRM de Clientes'],
          ['gallery', ImageUp, 'Galeria Antes e Depois'],
          ['services', Sparkles, 'Catalogo de Servicos'],
          ['testimonials', Heart, 'Depoimentos'],
          ['loyalty', Heart, 'Programa Fidelidade'],
          ['campaigns', MessageCircle, 'Campanhas WhatsApp'],
          ['settings', Settings, 'Configuracoes do Site'],
        ].map(([key, Icon, label]) => (
          <button key={key as string} className={activeModule === key ? 'active' : ''} onClick={() => setActiveModule(key as string)}>
            <Icon size={18} />
            {label as string}
          </button>
        ))}
        <button onClick={signOut}>
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <main className="studio-main">
        <header className="studio-header">
          <div>
            <p>Centro de bronzeamento e estetica</p>
            <h2>{moduleTitle(activeModule)}</h2>
          </div>
          <a href="/" target="_blank" rel="noreferrer">
            <Eye size={18} />
            Ver vitrine
          </a>
        </header>

        {activeModule === 'dashboard' && (
          <section className="os-grid">
            <Metric icon={<CalendarDays />} label="Agendamentos do dia" value={String(todayAppointments.length)} />
            <Metric icon={<Users />} label="Clientes da semana" value={String(weekClients.length)} />
            <Metric icon={<BarChart3 />} label="Receita estimada" value={money(estimatedRevenue)} />
            <Metric icon={<Sparkles />} label="Mais procurado" value={topService} />
            <AppointmentsTable appointments={appointments.slice(0, 8)} reload={loadAdminData} />
          </section>
        )}

        {activeModule === 'agenda' && <AgendaModule appointments={appointments} blocks={blocks} reload={loadAdminData} />}
        {activeModule === 'crm' && <CrmModule clients={clients} reload={loadAdminData} />}
        {activeModule === 'gallery' && <GalleryModule gallery={gallery} reload={loadAdminData} />}
        {activeModule === 'services' && <ServicesModule services={services} reload={loadAdminData} />}
        {activeModule === 'testimonials' && <TestimonialsModule testimonials={testimonials} reload={loadAdminData} />}
        {activeModule === 'loyalty' && <LoyaltyModule clients={clients} reload={loadAdminData} />}
        {activeModule === 'campaigns' && <CampaignsModule clients={clients} services={services} />}
        {activeModule === 'settings' && <SettingsModule settings={settings} reload={loadAdminData} />}
      </main>
    </div>
  );
}

function moduleTitle(module: string) {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    agenda: 'Agenda Inteligente',
    crm: 'CRM de Clientes',
    gallery: 'Galeria Antes e Depois',
    services: 'Catalogo de Servicos',
    testimonials: 'Depoimentos',
    loyalty: 'Programa Fidelidade',
    campaigns: 'Campanhas WhatsApp',
    settings: 'Configuracoes do Site',
  };
  return titles[module] ?? 'Solare Studio OS';
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function AppointmentsTable({ appointments, reload }: { appointments: Appointment[]; reload: () => Promise<void> }) {
  async function updateStatus(id: string, status: Appointment['status']) {
    if (!supabase) return;
    await supabase.from('appointments').update({ status }).eq('id', id);
    await reload();
  }

  return (
    <div className="os-panel wide">
      <h3>Agendamentos recebidos</h3>
      <div className="os-table">
        {appointments.map((appointment) => (
          <div key={appointment.id}>
            <span>{appointment.client_name}</span>
            <span>{appointment.services?.name ?? 'Servico'}</span>
            <span>{appointment.preferred_date} - {appointment.preferred_time}</span>
            <select value={appointment.status} onChange={(event) => void updateStatus(appointment.id, event.target.value as Appointment['status'])}>
              {statusList.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgendaModule({ appointments, blocks, reload }: { appointments: Appointment[]; blocks: TimeBlock[]; reload: () => Promise<void> }) {
  const [block, setBlock] = useState({ block_date: '', start_time: '', end_time: '', reason: '' });

  async function addBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from('time_blocks').insert(block);
    setBlock({ block_date: '', start_time: '', end_time: '', reason: '' });
    await reload();
  }

  return (
    <section className="module-grid">
      <div className="calendar-board">
        {Array.from({ length: 14 }).map((_, index) => {
          const date = new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          return (
            <article key={date}>
              <strong>{date.slice(5).replace('-', '/')}</strong>
              <span>{appointments.filter((appointment) => appointment.preferred_date === date).length} agend.</span>
            </article>
          );
        })}
      </div>
      <form className="os-form" onSubmit={addBlock}>
        <h3>Bloqueio de horarios</h3>
        <input type="date" value={block.block_date} onChange={(event) => setBlock({ ...block, block_date: event.target.value })} />
        <input placeholder="Inicio" value={block.start_time} onChange={(event) => setBlock({ ...block, start_time: event.target.value })} />
        <input placeholder="Fim" value={block.end_time} onChange={(event) => setBlock({ ...block, end_time: event.target.value })} />
        <textarea placeholder="Motivo" value={block.reason} onChange={(event) => setBlock({ ...block, reason: event.target.value })} />
        <button><Plus size={16} /> Bloquear horario</button>
        {blocks.map((item) => <small key={item.id}>{item.block_date} - {item.start_time}-{item.end_time} - {item.reason}</small>)}
      </form>
    </section>
  );
}

function CrmModule({ clients, reload }: { clients: ClientProfile[]; reload: () => Promise<void> }) {
  const [client, setClient] = useState({ name: '', whatsapp: '', history: '', last_procedure: '', notes: '' });

  async function saveClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from('clients').insert(client);
    setClient({ name: '', whatsapp: '', history: '', last_procedure: '', notes: '' });
    await reload();
  }

  return (
    <section className="module-grid">
      <form className="os-form" onSubmit={saveClient}>
        <h3>Novo cliente</h3>
        <input placeholder="Nome" value={client.name} onChange={(event) => setClient({ ...client, name: event.target.value })} />
        <input placeholder="WhatsApp" value={client.whatsapp} onChange={(event) => setClient({ ...client, whatsapp: event.target.value })} />
        <input placeholder="Ultimo procedimento" value={client.last_procedure} onChange={(event) => setClient({ ...client, last_procedure: event.target.value })} />
        <textarea placeholder="Historico e observacoes" value={client.notes} onChange={(event) => setClient({ ...client, notes: event.target.value })} />
        <button><Plus size={16} /> Salvar cliente</button>
      </form>
      <div className="client-list">
        {clients.map((item) => (
          <article key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.whatsapp}</p>
            <span>{item.last_procedure || 'Sem procedimento registrado'}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function GalleryModule({ gallery, reload }: { gallery: GalleryItem[]; reload: () => Promise<void> }) {
  const [item, setItem] = useState({ title: '', image_url: '', category: categories[0], active: true });
  const [uploading, setUploading] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from('gallery').insert(item);
    setItem({ title: '', image_url: '', category: categories[0], active: true });
    await reload();
  }

  async function toggle(id: string, active: boolean) {
    if (!supabase) return;
    await supabase.from('gallery').update({ active: !active }).eq('id', id);
    await reload();
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadMedia(file, 'gallery');
      setItem((current) => ({ ...current, image_url: imageUrl }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="module-grid">
      <form className="os-form" onSubmit={save}>
        <h3>Upload por categoria</h3>
        <input placeholder="Titulo" value={item.title} onChange={(event) => setItem({ ...item, title: event.target.value })} />
        <label className="file-field">
          <ImageUp size={16} />
          {uploading ? 'Enviando foto...' : 'Enviar foto real'}
          <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0])} />
        </label>
        <input placeholder="URL da imagem ou Storage" value={item.image_url} onChange={(event) => setItem({ ...item, image_url: event.target.value })} />
        <select value={item.category} onChange={(event) => setItem({ ...item, category: event.target.value })}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <button><ImageUp size={16} /> Publicar foto</button>
      </form>
      <div className="admin-gallery">
        {gallery.map((photo) => (
          <article key={photo.id}>
            <img src={photo.image_url} alt={photo.title} />
            <button onClick={() => void toggle(photo.id, photo.active)}>{photo.active ? 'Ativa' : 'Oculta'}</button>
            <span>{photo.category}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesModule({ services, reload }: { services: Service[]; reload: () => Promise<void> }) {
  const [service, setService] = useState({ name: '', description: '', price: '', duration: '', image_url: '', active: true });
  const [uploading, setUploading] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from('services').insert({ ...service, price: service.price ? Number(service.price) : null });
    setService({ name: '', description: '', price: '', duration: '', image_url: '', active: true });
    await reload();
  }

  async function remove(id: string) {
    if (!supabase) return;
    await supabase.from('services').delete().eq('id', id);
    await reload();
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadMedia(file, 'services');
      setService((current) => ({ ...current, image_url: imageUrl }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="module-grid">
      <form className="os-form" onSubmit={save}>
        <h3>Catalogo de procedimentos</h3>
        <input placeholder="Nome" value={service.name} onChange={(event) => setService({ ...service, name: event.target.value })} />
        <input placeholder="Preco" value={service.price} onChange={(event) => setService({ ...service, price: event.target.value })} />
        <input placeholder="Tempo medio" value={service.duration} onChange={(event) => setService({ ...service, duration: event.target.value })} />
        <label className="file-field">
          <ImageUp size={16} />
          {uploading ? 'Enviando imagem...' : 'Enviar imagem do servico'}
          <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0])} />
        </label>
        <input placeholder="Imagem" value={service.image_url} onChange={(event) => setService({ ...service, image_url: event.target.value })} />
        <textarea placeholder="Descricao" value={service.description} onChange={(event) => setService({ ...service, description: event.target.value })} />
        <button><Plus size={16} /> Adicionar servico</button>
      </form>
      <div className="service-admin-list">
        {services.map((item) => (
          <article key={item.id}>
            <Sparkles size={18} />
            <div>
              <h3>{item.name}</h3>
              <p>{money(item.price)} - {item.duration}</p>
            </div>
            <button><Pencil size={16} /></button>
            <button onClick={() => void remove(item.id)}><Trash2 size={16} /></button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TestimonialsModule({ testimonials, reload }: { testimonials: Testimonial[]; reload: () => Promise<void> }) {
  const [testimonial, setTestimonial] = useState({ client_name: '', text: '', image_url: '', active: true });
  const [uploading, setUploading] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from('testimonials').insert(testimonial);
    setTestimonial({ client_name: '', text: '', image_url: '', active: true });
    await reload();
  }

  async function toggle(id: string, active: boolean) {
    if (!supabase) return;
    await supabase.from('testimonials').update({ active: !active }).eq('id', id);
    await reload();
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadMedia(file, 'testimonials');
      setTestimonial((current) => ({ ...current, image_url: imageUrl }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="module-grid">
      <form className="os-form" onSubmit={save}>
        <h3>Provas reais e depoimentos</h3>
        <input placeholder="Nome da cliente" value={testimonial.client_name} onChange={(event) => setTestimonial({ ...testimonial, client_name: event.target.value })} />
        <label className="file-field">
          <ImageUp size={16} />
          {uploading ? 'Enviando foto...' : 'Enviar foto da cliente'}
          <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0])} />
        </label>
        <input placeholder="Imagem URL" value={testimonial.image_url} onChange={(event) => setTestimonial({ ...testimonial, image_url: event.target.value })} />
        <textarea placeholder="Depoimento" value={testimonial.text} onChange={(event) => setTestimonial({ ...testimonial, text: event.target.value })} />
        <button><Plus size={16} /> Salvar depoimento</button>
      </form>
      <div className="testimonial-admin-list">
        {testimonials.map((item) => (
          <article key={item.id}>
            {item.image_url && <img src={item.image_url} alt={item.client_name} />}
            <div>
              <h3>{item.client_name}</h3>
              <p>{item.text}</p>
            </div>
            <button onClick={() => void toggle(item.id, item.active)}>{item.active ? 'Ativo' : 'Oculto'}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoyaltyModule({ clients, reload }: { clients: ClientProfile[]; reload: () => Promise<void> }) {
  async function addBonus(client: ClientProfile) {
    if (!supabase) return;
    await supabase.from('clients').update({ sessions_count: client.sessions_count + 1, bonus_balance: client.bonus_balance + 1 }).eq('id', client.id);
    await reload();
  }

  return (
    <div className="loyalty-grid">
      {clients.map((client) => (
        <article key={client.id}>
          <Heart size={22} />
          <h3>{client.name}</h3>
          <p>{client.sessions_count} sessoes - {client.bonus_balance} bonus</p>
          <button onClick={() => void addBonus(client)}>Registrar sessao</button>
        </article>
      ))}
    </div>
  );
}

function CampaignsModule({ clients, services }: { clients: ClientProfile[]; services: Service[] }) {
  const phones = clients.map((client) => client.whatsapp).join(', ');
  const message = `Ola! A Josy Leao Solare esta com horarios para ${services[0]?.name ?? 'bronzeamento premium'}. Quer reservar seu momento Solare?`;

  return (
    <section className="campaign-box">
      <Download size={28} />
      <h3>Campanhas WhatsApp</h3>
      <p>Copie a lista de clientes e use mensagens prontas para campanhas de retorno, bronze da semana ou agenda aberta.</p>
      <textarea readOnly value={phones} />
      <textarea readOnly value={message} />
    </section>
  );
}

function SettingsModule({ settings, reload }: { settings: BusinessSettings; reload: () => Promise<void> }) {
  const [draft, setDraft] = useState(settings);
  const [uploading, setUploading] = useState('');

  useEffect(() => setDraft(settings), [settings]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    await supabase.from('settings').upsert(draft);
    await reload();
  }

  async function handleUpload(file: File | undefined, field: 'logo_url' | 'hero_image_url') {
    if (!file) return;
    setUploading(field);
    try {
      const imageUrl = await uploadMedia(file, 'settings');
      setDraft((current) => ({ ...current, [field]: imageUrl }));
    } finally {
      setUploading('');
    }
  }

  return (
    <form className="os-form settings-form" onSubmit={save}>
      <h3>Configuracoes do site</h3>
      <input value={draft.business_name} onChange={(event) => setDraft({ ...draft, business_name: event.target.value })} placeholder="Nome da empresa" />
      <input value={draft.whatsapp} onChange={(event) => setDraft({ ...draft, whatsapp: event.target.value })} placeholder="WhatsApp" />
      <input value={draft.instagram} onChange={(event) => setDraft({ ...draft, instagram: event.target.value })} placeholder="Instagram" />
      <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} placeholder="Endereco" />
      <label className="file-field">
        <ImageUp size={16} />
        {uploading === 'logo_url' ? 'Enviando logo...' : 'Enviar logo'}
        <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0], 'logo_url')} />
      </label>
      <input value={draft.logo_url || ''} onChange={(event) => setDraft({ ...draft, logo_url: event.target.value })} placeholder="Logo URL" />
      <label className="file-field">
        <ImageUp size={16} />
        {uploading === 'hero_image_url' ? 'Enviando hero...' : 'Enviar imagem principal'}
        <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0], 'hero_image_url')} />
      </label>
      <input value={draft.hero_image_url || ''} onChange={(event) => setDraft({ ...draft, hero_image_url: event.target.value })} placeholder="Hero image URL" />
      <button><CheckCircle2 size={16} /> Salvar site</button>
    </form>
  );
}

export default App;
