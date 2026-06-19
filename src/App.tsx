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
  type Product,
  type Service,
  type Settings as BusinessSettings,
  type Testimonial,
  type TimeBlock,
} from './lib/supabase';
import { benefits, fallbackGallery, fallbackProducts, fallbackServices, fallbackSettings, fallbackTestimonials } from './data/defaults';

const categories = ['Bronze', 'Marquinha', 'Estetica facial', 'Estetica corporal'];
const productCategories = ['Lingerie', 'Cosmeticos', 'Acessorios', 'Presentes'];
const statusList: Appointment['status'][] = ['novo', 'confirmado', 'realizado', 'cancelado'];
const periods = ['Manha', 'Tarde', 'Noite'];
const demoProductsKey = 'solare_demo_products';

function money(value?: number | null) {
  return value ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Sob consulta';
}

function buildWhatsAppUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function readDemoProducts() {
  try {
    const raw = window.localStorage.getItem(demoProductsKey);
    return raw ? (JSON.parse(raw) as Product[]) : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

function saveDemoProducts(products: Product[]) {
  window.localStorage.setItem(demoProductsKey, JSON.stringify(products));
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [gallery, setGallery] = useState<GalleryItem[]>(fallbackGallery);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [form, setForm] = useState({
    client_name: '',
    phone: '',
    service_id: fallbackProducts[0]?.id ?? '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
  });

  useEffect(() => {
    async function loadPublicData() {
      if (!supabase) {
        setProducts(readDemoProducts().filter((product) => product.active));
        return;
      }

      const [settingsResult, productsResult, galleryResult, testimonialsResult] = await Promise.all([
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: true }),
        supabase.from('gallery').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').eq('active', true).order('created_at', { ascending: false }),
      ]);

      if (settingsResult.data) setSettings(settingsResult.data);
      if (productsResult.data?.length) setProducts(productsResult.data);
      if (galleryResult.data?.length) setGallery(galleryResult.data);
      if (testimonialsResult.data?.length) setTestimonials(testimonialsResult.data);
    }

    void loadPublicData();
  }, []);

  const quickMessage = buildWhatsAppUrl(
    settings.whatsapp,
    'Ola! Quero receber o catalogo adulto 18+ e consultar disponibilidade dos produtos.',
  );
  const visibleProducts = (products.length >= 20 ? products : fallbackProducts).filter((product) => product.active).slice(0, 20);
  const selectedProduct = visibleProducts.find((product) => product.id === form.service_id) ?? visibleProducts[0];
  const shoppingHighlights = [
    {
      name: 'Atendimento discreto',
      description: 'Compra guiada pelo WhatsApp com linguagem segura, acolhedora e sem exposicao.',
    },
    {
      name: 'Curadoria adulta 18+',
      description: 'Produtos selecionados para diferentes momentos, estilos e niveis de experiencia.',
    },
    {
      name: 'Fotos e disponibilidade',
      description: 'Veja detalhes, cores, valores e estoque antes de confirmar o pedido.',
    },
    {
      name: 'Presente especial',
      description: 'Opcoes para surpreender com elegancia, discricao e apresentacao premium.',
    },
    {
      name: 'Entrega combinada',
      description: 'Combine retirada ou envio diretamente pelo WhatsApp.',
    },
    {
      name: 'Orientacao personalizada',
      description: 'Escolha com mais seguranca a partir do seu objetivo e preferencia.',
    },
  ];
  const galleryModels = (gallery.length >= 6 ? gallery : fallbackGallery).slice(0, 6);
  const marqueeWords = ['Catalogo adulto 18+', 'Atendimento discreto', 'Presentes sensuais', 'Acessorios premium', ...benefits.slice(0, 2)];

  async function handleAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = `Ola, tenho interesse no produto ${selectedProduct?.name ?? 'do catalogo adulto 18+'}. Meu nome e ${form.client_name || '[nome]'}. Meu WhatsApp e ${form.phone || '[telefone]'}. ${form.notes ? `Observacoes: ${form.notes}` : ''}`;

    if (supabase) {
      await supabase.from('appointments').insert({
        client_name: form.client_name,
        phone: form.phone,
        service_id: null,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        status: 'novo',
        notes: `Produto: ${selectedProduct?.name ?? 'Catalogo'} | ${form.notes}`,
      });

      if (form.client_name && form.phone) {
        await supabase.from('clients').upsert(
          {
            name: form.client_name,
            whatsapp: form.phone,
            last_procedure: selectedProduct?.name ?? null,
            notes: form.notes,
          },
          { onConflict: 'whatsapp' },
        );
      }
    }

    window.open(buildWhatsAppUrl(settings.whatsapp, message), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="preview-page">
      <header className="preview-header">
        <a href="#topo" className="preview-brand" aria-label={settings.business_name}>
          <img src={settings.logo_url || fallbackSettings.logo_url || ''} alt="" />
          <span>Josy Leao <em>Solare</em></span>
        </a>
        <nav className="preview-nav">
          <a href="#servicos">Catalogo</a>
          <a href="#produtos">Produtos</a>
          <a href="#storytelling">Experiencia</a>
          <a href="#galeria">Galeria</a>
          <a href="/admin/login">Admin</a>
        </nav>
        <a className="preview-nav-cta" href="#agendamento">WhatsApp</a>
        <button className="preview-menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsMenuOpen((value) => !value)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {isMenuOpen && (
          <div className="preview-mobile-menu">
            {[
              ['servicos', 'Catalogo'],
              ['produtos', 'Produtos'],
              ['storytelling', 'Experiencia'],
              ['galeria', 'Galeria'],
              ['agendamento', 'Agenda'],
            ].map(([href, label]) => (
              <a key={href} href={`#${href}`} onClick={() => setIsMenuOpen(false)}>{label}</a>
            ))}
            <a href="/admin/login">Solare Studio OS</a>
          </div>
        )}
      </header>

      <main>
        <section id="topo" className="preview-hero">
          <div className="preview-hero-glow" aria-hidden="true" />
          <img className="preview-watermark" src={settings.logo_url || fallbackSettings.logo_url || ''} alt="" aria-hidden="true" />
          <div className="preview-vignette" aria-hidden="true" />
          <div className="preview-hero-content">
            <span>Belem do Para</span>
            <h1>Desejo, cuidado<br /><em>e discricao.</em></h1>
            <p>Catalogo adulto 18+ com produtos selecionados, atendimento reservado e compra guiada pelo WhatsApp.</p>
            <div className="preview-actions">
              <a className="preview-primary" href="#produtos">Ver catalogo</a>
              <a className="preview-secondary" href="#agendamento">Comprar pelo WhatsApp</a>
            </div>
            <div className="preview-trust-row" aria-label="Diferenciais de compra">
              <span>18+</span>
              <span>Atendimento discreto</span>
              <span>Consulta antes do pedido</span>
            </div>
          </div>
          <div className="preview-scroll" aria-hidden="true">
            <span>Role</span>
            <i />
          </div>
        </section>

        <div className="preview-marquee" aria-hidden="true">
          <div className="preview-marquee-track">
            {Array.from({ length: 2 }).map((_, index) => (
              <div className="preview-marquee-group" key={index}>
                {marqueeWords.map((word) => (
                  <span key={`${word}-${index}`}>{word}<b>✦</b></span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section id="produtos" className="preview-products">
          <div className="preview-section-head">
            <span>Sexy shop</span>
            <h2>Catalogo com <em>produtos premium.</em></h2>
          </div>
          <div className="preview-product-grid">
            {visibleProducts.map((product, index) => {
              const message = `Ola, tenho interesse no produto ${product.name}. Pode me enviar mais informacoes?`;
              return (
                <article className="preview-product-card" key={product.id}>
                  <div className="preview-product-image">
                    {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" /> : <span>Imagem</span>}
                  </div>
                  <div>
                    <small>{String(index + 1).padStart(2, '0')} / {product.category || 'Produto'}</small>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <strong>{money(product.price)}</strong>
                    <a href={buildWhatsAppUrl(settings.whatsapp, message)} target="_blank" rel="noreferrer">Consultar no WhatsApp</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="storytelling" className="preview-story">
          <div>
            <span> A compra </span>
            <h2>Mais do que produto.<br /><em>Uma escolha discreta.</em></h2>
            <i />
            <p>Cada item foi pensado para quem busca desejo, autocuidado e liberdade com atendimento reservado, elegante e seguro.</p>
          </div>
        </section>

        <section id="servicos" className="preview-services">
          <div className="preview-section-head">
            <span>Catalogo</span>
            <h2>Como comprar com <em>seguranca.</em></h2>
          </div>
          <div className="preview-service-grid">
            {shoppingHighlights.map((service, index) => (
              <article className="preview-service-card" key={service.name}>
                <Sparkles size={32} strokeWidth={1.25} />
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <small>{String(index + 1).padStart(2, '0')} / Compra orientada</small>
                <i />
              </article>
            ))}
          </div>
        </section>

        <section id="galeria" className="preview-gallery">
          <div className="preview-section-head">
            <span>Galeria</span>
            <h2>Um olhar sobre o <em>estudio</em></h2>
          </div>
          <div className="preview-gallery-grid">
            {galleryModels.map((item, index) => (
              <article key={item.id} className={index === 0 ? 'featured' : index === 3 ? 'wide' : ''}>
                <img src={item.image_url} alt={item.title} loading="lazy" />
                <div><b>{item.title}</b><span>{item.category}</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="preview-testimonials">
          <div className="preview-section-head">
            <span>Provas reais</span>
            <h2>O que dizem sobre <em>a experiencia.</em></h2>
          </div>
          <div className="preview-testimonial-grid">
            {testimonials.map((item) => (
              <blockquote key={item.id}>
                <b>“</b>
                <p>{item.text}</p>
                <cite>{item.client_name}</cite>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="agendamento" className="preview-booking">
          <div className="preview-booking-bg" aria-hidden="true" />
          <div className="preview-section-head">
            <span>Agenda</span>
            <h2>Quer consultar<br /><em>um produto?</em></h2>
          </div>
          <form className="preview-booking-form" onSubmit={handleAppointment}>
            <input required value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} placeholder="Nome" />
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="WhatsApp" />
            <select value={form.service_id} onChange={(event) => setForm({ ...form, service_id: event.target.value })}>
              {visibleProducts.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <input type="date" value={form.preferred_date} onChange={(event) => setForm({ ...form, preferred_date: event.target.value })} />
            <select value={form.preferred_time} onChange={(event) => setForm({ ...form, preferred_time: event.target.value })}>
              <option value="">Horario desejado</option>
              {periods.map((period) => <option key={period}>{period}</option>)}
            </select>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Observacoes" />
            <button type="submit">Consultar no WhatsApp</button>
          </form>
        </section>

        <section className="preview-location">
          <span>Localizacao</span>
          <h2>{settings.address}</h2>
          <a className="preview-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noreferrer">Abrir mapa</a>
        </section>
      </main>

      <footer className="preview-footer">
        <div>
          <img src={settings.logo_url || fallbackSettings.logo_url || ''} alt="" />
          <h3>Josy Leao <em>Solare</em></h3>
        </div>
        <nav>
          <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={20} /></a>
          <a href={quickMessage} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>
        </nav>
        <p>{settings.address}</p>
        <i />
        <small>© {new Date().getFullYear()} Josy Leao Solare. Todos os direitos reservados.</small>
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
      if (email.trim().toLowerCase() === 'josyleao' && password === 'mucuretdanasa') {
        window.sessionStorage.setItem('solare_demo_admin', 'true');
        window.location.href = '/admin/dashboard';
        return;
      }

      setError('Login ou senha incorretos.');
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
        <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Login" />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" />
        {error && <strong>{error}</strong>}
        <button className="gold-button soft" type="submit">{isSupabaseConfigured ? 'Entrar no sistema' : 'Entrar no Studio OS'}</button>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const [sessionReady, setSessionReady] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [gallery, setGallery] = useState<GalleryItem[]>(fallbackGallery);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(fallbackSettings);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    async function bootstrap() {
      if (!supabase) {
        if (window.sessionStorage.getItem('solare_demo_admin') === 'true') {
          setProducts(readDemoProducts());
          setSessionReady(true);
          return;
        }

        window.location.href = '/admin/login';
        return;
      }

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

    const [productsResult, servicesResult, galleryResult, appointmentsResult, testimonialsResult, settingsResult, clientsResult, blocksResult] =
      await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('gallery').select('*').order('created_at', { ascending: false }),
        supabase.from('appointments').select('*, services(name, price, duration)').order('created_at', { ascending: false }),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('time_blocks').select('*').order('block_date', { ascending: true }),
      ]);

    if (productsResult.data?.length) setProducts(productsResult.data);
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
    window.sessionStorage.removeItem('solare_demo_admin');
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
          ['products', Sparkles, 'Produtos Sexy Shop'],
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
        {activeModule === 'products' && <ProductsModule products={products} setProducts={setProducts} reload={loadAdminData} />}
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
    products: 'Produtos Sexy Shop',
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

function ProductsModule({
  products,
  setProducts,
  reload,
}: {
  products: Product[];
  setProducts: (products: Product[]) => void;
  reload: () => Promise<void>;
}) {
  const emptyProduct = { name: '', description: '', price: '', image_url: '', category: productCategories[0], active: true };
  const [product, setProduct] = useState(emptyProduct);
  const [editingId, setEditingId] = useState('');
  const [uploading, setUploading] = useState(false);

  async function persistDemo(nextProducts: Product[]) {
    setProducts(nextProducts);
    saveDemoProducts(nextProducts);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name: product.name,
      description: product.description,
      price: product.price ? Number(product.price) : null,
      image_url: product.image_url || null,
      category: product.category,
      active: product.active,
    };

    if (!supabase) {
      const nextProduct: Product = {
        id: editingId || `product-${Date.now()}`,
        ...payload,
        created_at: products.find((item) => item.id === editingId)?.created_at ?? new Date().toISOString(),
      };
      const nextProducts = editingId
        ? products.map((item) => (item.id === editingId ? nextProduct : item))
        : [nextProduct, ...products];
      await persistDemo(nextProducts);
      setProduct(emptyProduct);
      setEditingId('');
      return;
    }

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('products').insert(payload);
    }
    setProduct(emptyProduct);
    setEditingId('');
    await reload();
  }

  function edit(item: Product) {
    setEditingId(item.id);
    setProduct({
      name: item.name,
      description: item.description ?? '',
      price: item.price ? String(item.price) : '',
      image_url: item.image_url ?? '',
      category: item.category ?? productCategories[0],
      active: item.active,
    });
  }

  async function remove(id: string) {
    if (!supabase) {
      await persistDemo(products.filter((item) => item.id !== id));
      return;
    }
    await supabase.from('products').delete().eq('id', id);
    await reload();
  }

  async function toggle(item: Product) {
    if (!supabase) {
      await persistDemo(products.map((productItem) => (
        productItem.id === item.id ? { ...productItem, active: !productItem.active } : productItem
      )));
      return;
    }
    await supabase.from('products').update({ active: !item.active }).eq('id', item.id);
    await reload();
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = supabase ? await uploadMedia(file, 'products') : await fileToDataUrl(file);
      setProduct((current) => ({ ...current, image_url: imageUrl }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="module-grid">
      <form className="os-form" onSubmit={save}>
        <h3>{editingId ? 'Editar produto' : 'Novo produto sexy shop'}</h3>
        <input required placeholder="Nome do produto" value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} />
        <input placeholder="Preco" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} />
        <select value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })}>
          {productCategories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <label className="file-field">
          <ImageUp size={16} />
          {uploading ? 'Enviando imagem...' : 'Enviar imagem do produto'}
          <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0])} />
        </label>
        <input placeholder="URL da imagem" value={product.image_url} onChange={(event) => setProduct({ ...product, image_url: event.target.value })} />
        <textarea placeholder="Descricao e informacoes do produto" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} />
        <button><Plus size={16} /> {editingId ? 'Salvar alteracoes' : 'Adicionar produto'}</button>
      </form>
      <div className="product-admin-list">
        {products.map((item) => (
          <article key={item.id}>
            {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div />}
            <section>
              <span>{item.category}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <strong>{money(item.price)}</strong>
            </section>
            <button onClick={() => edit(item)}><Pencil size={16} /></button>
            <button onClick={() => void toggle(item)}>{item.active ? 'Ativo' : 'Oculto'}</button>
            <button onClick={() => void remove(item.id)}><Trash2 size={16} /></button>
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
