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
    <div className="site-shell">
      <header className="topbar">
        <a href="/" className="brand-name" aria-label={settings.business_name}>
          {settings.business_name}
        </a>
        <nav className="desktop-nav">
          <a href="#catalogo">Catalogo</a>
          <a href="#beneficios">Bronze</a>
          <a href="#galeria">Galeria</a>
          <a href="#agendamento">WhatsApp</a>
        </nav>
        <a className="insta-link" href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
          <Camera size={20} />
        </a>
        <button className="menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsMenuOpen((value) => !value)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {isMenuOpen && (
          <div className="mobile-menu">
            {['catalogo', 'beneficios', 'galeria', 'agendamento'].map((item) => (
              <a key={item} href={`#${item}`} onClick={() => setIsMenuOpen(false)}>
                {item}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        <section id="hero" className="hero-frame refined-hero">
          <div className="hero-media" aria-hidden="true">
            <img src={settings.logo_url || fallbackSettings.logo_url || ''} alt="" />
          </div>
          <div className="hero-text zara-hero">
            <img className="hero-logo-mark" src={settings.logo_url || fallbackSettings.logo_url || ''} alt={settings.business_name} />
            <span>Centro de Bronzeamento e Estetica - Belem/PA</span>
            <h1>Sua pele, sua luz, sua melhor versao.</h1>
            <p>
              Cada detalhe do bronze e pensado para realcar sua beleza com naturalidade, seguranca e sofisticacao.
            </p>
            <div>
              <a className="gold-button soft" href="#agendamento">
                Agendar experiencia
              </a>
              <a className="outline-button soft" href="#galeria">
                Ver resultados
              </a>
            </div>
          </div>
          <div className="scroll-indicator" aria-hidden="true">
            <span>Scroll</span>
            <i />
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <span>Marquinha personalizada</span>
          <b />
          <span>Pele iluminada</span>
          <b />
          <span>Atendimento feminino</span>
          <b />
          <span>Resultado natural</span>
        </div>

        <section id="catalogo" className="catalog-section refined-section runway-section">
          <p className="section-kicker">Catalogo de procedimentos</p>
          <h2>
            Mais que bronzeamento: <em>uma experiencia de autoestima.</em>
          </h2>
          <div className="product-grid soft-grid runway-grid">
            {services.map((service) => (
              <article className="product-card soft-card" key={service.id}>
                <div className="product-image">
                  <img src={service.image_url || fallbackSettings.hero_image_url || ''} alt={service.name} loading="lazy" />
                </div>
                <div className="product-info">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <span>{money(service.price)} - {service.duration || 'Tempo sob consulta'}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="beneficios" className="benefits-band">
          <p className="section-kicker">Destaques do bronze</p>
          <h2>
            Cuidado feminino com <em>acabamento natural.</em>
          </h2>
          <div className="benefit-grid">
            {benefits.map((benefit) => (
              <span key={benefit}>{benefit}</span>
            ))}
          </div>
        </section>

        <section id="galeria" className="catalog-section refined-section gallery-runway">
          <p className="section-kicker">Galeria de resultados</p>
          <h2>
            Bronze, marquinha e beleza <em>em fotos reais.</em>
          </h2>
          <div className="editorial-gallery immersive-gallery">
            {gallery.map((item) => (
              <article key={item.id}>
                <img src={item.image_url} alt={item.title} loading="lazy" />
                <div>
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-band refined-about">
          <p className="section-kicker">Storytelling</p>
          <h2>
            Uma experiencia delicada para <em>realcar a sua presenca.</em>
          </h2>
          <p>
            A Josy Leao Solare vende transformacao, autoestima, bronze perfeito, marquinha e cuidado com o corpo em um
            ambiente pensado para a mulher se sentir acolhida, segura e poderosa.
          </p>
          <div className="testimonial-row">
            {testimonials.map((item) => (
              <blockquote key={item.id}>
                "{item.text}"
                <cite>{item.client_name}</cite>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="agendamento" className="booking-band refined-booking">
          <p className="section-kicker">Agenda de bronzeamento</p>
          <h2>
            Escolha seu <em>ritual.</em>
          </h2>
          <form className="booking-form soft-form" onSubmit={handleAppointment}>
            <input required value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} placeholder="Nome" />
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="WhatsApp" />
            <select value={form.service_id} onChange={(event) => setForm({ ...form, service_id: event.target.value })}>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            <input type="date" value={form.preferred_date} onChange={(event) => setForm({ ...form, preferred_date: event.target.value })} />
            <select value={form.preferred_time} onChange={(event) => setForm({ ...form, preferred_time: event.target.value })}>
              <option value="">Horario desejado</option>
              {periods.map((period) => <option key={period}>{period}</option>)}
            </select>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Observacoes" />
            <button className="gold-button soft" type="submit">Gerar mensagem inteligente</button>
          </form>
        </section>

        <section id="sobre" className="location-band">
          <p className="section-kicker">Localizacao</p>
          <h2>{settings.address}</h2>
          <a className="outline-button soft" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noreferrer">
            Abrir mapa
          </a>
        </section>
      </main>

      <footer className="footer refined-footer">
        <div>
          <h3>{settings.business_name}</h3>
          <p>Centro de Bronzeamento e Estetica em Belem/PA.</p>
        </div>
        <div>
          <h4>Gestao</h4>
          <a href="/admin/login">Solare Studio OS</a>
          <a href="#agendamento">Agenda</a>
        </div>
        <div>
          <h4>Contato</h4>
          <a href={quickMessage} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={settings.instagram} target="_blank" rel="noreferrer">@josyleaosolare</a>
        </div>
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
      setError('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar o login.');
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
        {!isSupabaseConfigured && <small>Supabase ainda nao configurado neste deploy.</small>}
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@studio.com" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" />
        {error && <strong>{error}</strong>}
        <button className="gold-button soft" type="submit">Entrar no sistema</button>
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
