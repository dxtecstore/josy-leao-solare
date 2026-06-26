import type { FormEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
import { fallbackGallery, fallbackProducts, fallbackServices, fallbackSettings, fallbackTestimonials } from './data/defaults';
import { socialMediaContent } from './data/socialMediaContent';

const categories = ['Bronze', 'Marquinha', 'Estética facial', 'Estética corporal'];
const productCategories = ['Lingerie', 'Cosméticos', 'Acessórios', 'Presentes'];
const statusList: Appointment['status'][] = ['novo', 'confirmado', 'realizado', 'cancelado'];
const periods = ['Manha', 'Tarde', 'Noite'];
const demoProductsKey = 'solare_demo_products';
const demoGalleryKey = 'solare_demo_gallery';
const demoSettingsKey = 'solare_demo_settings';
const mediaVersion = '20260622b';
const officialInstagramUrl = 'https://www.instagram.com/josyleaooficial/';

function mediaUrl(path: string) {
  return `${path}?v=${mediaVersion}`;
}

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

function readDemoGallery() {
  try {
    const raw = window.localStorage.getItem(demoGalleryKey);
    return raw ? (JSON.parse(raw) as GalleryItem[]) : fallbackGallery;
  } catch {
    return fallbackGallery;
  }
}

function saveDemoGallery(gallery: GalleryItem[]) {
  window.localStorage.setItem(demoGalleryKey, JSON.stringify(gallery));
}

function readDemoSettings() {
  try {
    const raw = window.localStorage.getItem(demoSettingsKey);
    return raw ? (JSON.parse(raw) as BusinessSettings) : fallbackSettings;
  } catch {
    return fallbackSettings;
  }
}

function saveDemoSettings(settings: BusinessSettings) {
  window.localStorage.setItem(demoSettingsKey, JSON.stringify(settings));
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
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [servicePage, setServicePage] = useState(0);
  const [servicesPerView, setServicesPerView] = useState(1);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [productPage, setProductPage] = useState(0);
  const [productsPerView, setProductsPerView] = useState(1);
  const serviceViewportRef = useRef<HTMLDivElement>(null);
  const productViewportRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    client_name: '',
    phone: '',
    service_id: 'bronze-natural',
    preferred_date: '',
    preferred_time: '',
    notes: '',
  });

  useEffect(() => {
    async function loadPublicData() {
      if (!supabase) {
        setSettings(readDemoSettings());
        setServices(fallbackServices.filter((service) => service.active));
        setProducts(readDemoProducts().filter((product) => product.active));
        return;
      }

      const [settingsResult, servicesResult, productsResult] = await Promise.all([
        supabase.from('settings').select('*').limit(1).maybeSingle(),
        supabase.from('services').select('*').eq('active', true).order('created_at', { ascending: true }),
        supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: true }),
      ]);

      if (settingsResult.data) setSettings(settingsResult.data);
      if (servicesResult.data?.length) setServices(servicesResult.data);
      if (productsResult.data?.length) setProducts(productsResult.data);
    }

    void loadPublicData();
  }, []);

  const whatsappMessage = 'Olá, vi o site da Josy Leão Solare e gostaria de agendar meu atendimento.';
  const ctaMessages = {
    bronze: 'Olá, gostaria de agendar meu bronzeamento.',
    correction: 'Olá, gostaria de saber mais sobre correção de marquinha.',
    banho: 'Olá, gostaria de agendar um Banho de Lua.',
    products: 'Olá, gostaria de conhecer os produtos disponíveis.',
    sexyShop: 'Olá, gostaria de saber mais sobre este produto.',
    location: 'Olá, gostaria de saber como chegar ao espaço.',
  };
  const quickMessage = buildWhatsAppUrl(settings.whatsapp, ctaMessages.bronze);
  const visibleServices = (services.length ? services : fallbackServices).filter((service) => service.active);
  const serviceImageFallback = (index: number) => fallbackServices[index]?.image_url || fallbackServices[0]?.image_url || '';
  const maxServicePage = Math.max(0, visibleServices.length - servicesPerView);
  const servicePageCount = Math.max(1, Math.ceil(visibleServices.length / servicesPerView));
  const activeServiceDot = Math.min(servicePageCount - 1, Math.floor(servicePage / servicesPerView));
  const serviceShift = servicePage * (100 / servicesPerView);
  const visibleProducts = (products.length >= 17 ? products : fallbackProducts).filter((product) => product.active).slice(0, 17);
  const productImageFallback = (index: number) => fallbackProducts[index]?.image_url || fallbackProducts[0]?.image_url || '';
  const maxProductPage = Math.max(0, visibleProducts.length - productsPerView);
  const productPageCount = Math.max(1, Math.ceil(visibleProducts.length / productsPerView));
  const activeProductDot = Math.min(productPageCount - 1, Math.floor(productPage / productsPerView));
  const productShift = productPage * (100 / productsPerView);
  const bookingOptions = [
    ...visibleServices.map((service) => ({ id: service.id, name: service.name })),
    ...visibleProducts.map((product) => ({ id: product.id, name: product.name })),
  ];
  const selectedInterest = bookingOptions.find((item) => item.id === form.service_id) ?? bookingOptions[0];
  const socialProof = [
    ['+2.000', 'clientes atendidas'],
    ['12,8 mil', 'seguidores no Instagram'],
    ['Nazaré', 'Belém/PA'],
    ['LGBTQIAPN+', 'ambiente acolhedor'],
  ];
  const bronzeHighlights = [
    {
      src: mediaUrl('/brand/solare-resultado-casal.jpg'),
      title: 'Ambiente Solare',
      category: 'Espaço e experiência',
      frame: 'wide full-frame',
    },
    {
      src: mediaUrl('/brand/solare-bronze-03.jpg'),
      title: 'Atendimento guiado',
      category: 'Design de biquíni',
      frame: 'portrait focus-top',
    },
    {
      src: mediaUrl('/brand/solare-bronze-02.jpg'),
      title: 'Resultado natural',
      category: 'Bronze em cabine',
      frame: 'portrait focus-top',
    },
    {
      src: mediaUrl('/brand/solare-bronze-01.jpg'),
      title: 'Marquinha iluminada',
      category: 'Bronzeamento premium',
      frame: 'detail focus-center',
    },
    {
      src: mediaUrl('/brand/solare-bronze-lgbt-resultado.jpg'),
      title: 'Bronze inclusivo',
      category: 'Resultado LGBTQIAPN+',
      frame: 'portrait focus-top',
    },
    {
      src: mediaUrl('/brand/solare-correcao-01.jpg'),
      title: 'Correção de biquíni',
      category: 'Transformação',
      frame: 'tall full-frame',
    },
    {
      src: mediaUrl('/brand/solare-correcao-02.jpg'),
      title: 'Marquinha redesenhada',
      category: 'Resultado real',
      frame: 'tall full-frame',
    },
    {
      src: mediaUrl('/brand/solare-bronze-04.jpg'),
      title: 'Pele dourada',
      category: 'Acabamento glow',
      frame: 'detail focus-center',
    },
    {
      src: mediaUrl('/brand/solare-bronze-05.jpg'),
      title: 'Marquinha glow',
      category: 'Detalhe real de bronze',
      frame: 'detail focus-center',
    },
  ];
  const marqueeWords = ['Bronzeamento premium', 'Marquinha dos sonhos', 'Design de biquíni', 'Spa banho', 'Atendimento feminino', 'Produtos 18+'];

  useEffect(() => {
    function updateProductsPerView() {
      if (window.innerWidth >= 1180) {
        setServicesPerView(3);
        setProductsPerView(4);
        return;
      }

      if (window.innerWidth >= 760) {
        setServicesPerView(2);
        setProductsPerView(3);
        return;
      }

      setServicesPerView(1);
      setProductsPerView(1);
    }

    updateProductsPerView();
    window.addEventListener('resize', updateProductsPerView);
    return () => window.removeEventListener('resize', updateProductsPerView);
  }, []);

  useEffect(() => {
    setProductPage((page) => Math.min(page, maxProductPage));
  }, [maxProductPage]);

  useEffect(() => {
    setServicePage((page) => Math.min(page, maxServicePage));
  }, [maxServicePage]);

  function goToServicePage(page: number) {
    const nextPage = Math.max(0, Math.min(page, maxServicePage));
    setServicePage(nextPage);

    if (servicesPerView === 1 && serviceViewportRef.current) {
      serviceViewportRef.current.scrollTo({
        left: serviceViewportRef.current.clientWidth * nextPage,
        behavior: 'smooth',
      });
    }
  }

  function goToProductPage(page: number) {
    const nextPage = Math.max(0, Math.min(page, maxProductPage));
    setProductPage(nextPage);

    if (productsPerView === 1 && productViewportRef.current) {
      productViewportRef.current.scrollTo({
        left: productViewportRef.current.clientWidth * nextPage,
        behavior: 'smooth',
      });
    }
  }

  function serviceWhatsAppMessage(serviceName: string) {
    const normalized = serviceName.toLowerCase();
    if (normalized.includes('banho')) return `Olá, gostaria de agendar ${serviceName}.`;
    if (normalized.includes('marquinha') || normalized.includes('biquíni') || normalized.includes('biquini')) {
      return `Olá, gostaria de saber mais sobre ${serviceName}.`;
    }
    return `Olá, gostaria de agendar ${serviceName}.`;
  }

  async function handleAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = `${whatsappMessage} Meu nome é ${form.client_name || '[nome]'}. Tenho interesse em ${selectedInterest?.name ?? 'agendar atendimento'}. ${form.preferred_date ? `Data desejada: ${form.preferred_date}.` : ''} ${form.preferred_time ? `Período: ${form.preferred_time}.` : ''} ${form.notes ? `Observações: ${form.notes}` : ''}`;

    if (supabase) {
      await supabase.from('appointments').insert({
        client_name: form.client_name,
        phone: form.phone,
        service_id: null,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        status: 'novo',
        notes: `Interesse: ${selectedInterest?.name ?? 'Atendimento'} | ${form.notes}`,
      });

      if (form.client_name && form.phone) {
        await supabase.from('clients').upsert(
          {
            name: form.client_name,
            whatsapp: form.phone,
            last_procedure: selectedInterest?.name ?? null,
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
          <span>Josy Leão <em>Solare</em></span>
        </a>
        <nav className="preview-nav">
          <a href="#servicos">Serviços</a>
          <a href="#galeria">Resultados</a>
          <a href="#produtos">Produtos</a>
          <a href="#social">Instagram</a>
          <a href="#agendamento">Agendar</a>
          <a href="/admin/login">Admin</a>
        </nav>
        <a className="preview-nav-cta" href={quickMessage} target="_blank" rel="noreferrer">WhatsApp</a>
        <button className="preview-menu-button" type="button" aria-label="Abrir menu" onClick={() => setIsMenuOpen((value) => !value)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {isMenuOpen && (
          <div className="preview-mobile-menu">
            {[
              ['servicos', 'Serviços'],
              ['galeria', 'Resultados'],
              ['produtos', 'Produtos'],
              ['social', 'Instagram'],
              ['agendamento', 'Agendar'],
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
          <video className="preview-hero-video" autoPlay muted loop playsInline preload="metadata" poster={mediaUrl('/brand/solare-bronze-07.jpg')} aria-hidden="true">
            <source src={mediaUrl('/brand/hero2.mp4')} type="video/mp4" />
          </video>
          <div className="preview-vignette" aria-hidden="true" />
          <div className="preview-hero-content">
            <span>Bronzeamento e estética em Belém</span>
            <h1>Sua marquinha<br /><em>dos sonhos.</em></h1>
            <p>Bronze, cuidado com a pele e atendimento acolhedor para realçar sua beleza com segurança.</p>
            <div className="preview-actions">
              <a className="preview-primary" href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.bronze)} target="_blank" rel="noreferrer">Agendar pelo WhatsApp</a>
              <a className="preview-secondary" href="#galeria">Ver resultados reais</a>
            </div>
            <div className="preview-trust-row" aria-label="Diferenciais da Josy Leão Solare">
              <span>+2.000 clientes</span>
              <span>Atendimento feminino</span>
              <span>12,8 mil no Instagram</span>
            </div>
            <p className="preview-hero-note">Av. Alcindo Cacela, 1474 - Nazaré, Belém/PA.</p>
          </div>
          <div className="preview-scroll" aria-hidden="true">
            <span>Role</span>
            <i />
          </div>
        </section>

        <section className="preview-opening-film">
          <div className="opening-film-copy">
            <span>Inauguração Solare</span>
            <h2>Um novo capítulo para viver beleza com mais presença.</h2>
            <p>Um registro especial do espaço, da energia da marca e da experiência que recebe cada cliente com cuidado, sofisticação e acolhimento.</p>
            <div>
              <a className="preview-primary" href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.bronze)} target="_blank" rel="noreferrer">Agendar pelo WhatsApp</a>
              <a className="preview-secondary" href="#social">Ver mais vídeos</a>
            </div>
          </div>
          <div className="opening-film-media">
            <video controls playsInline preload="metadata">
              <source src={mediaUrl('/videos/inauguracao.mp4')} type="video/mp4" />
            </video>
          </div>
        </section>

        <div className="preview-marquee" aria-hidden="true">
          <div className="preview-marquee-track">
            {Array.from({ length: 2 }).map((_, index) => (
              <div className="preview-marquee-group" key={index}>
                {marqueeWords.map((word) => (
                  <span key={`${word}-${index}`}>{word}<b>*</b></span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="preview-proof">
          {socialProof.map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>

        <section id="storytelling" className="preview-story">
          <div className="preview-story-media">
            <img src={mediaUrl('/brand/josy-storytelling-premium.png')} alt="Josy Leão Solare, especialista em bronzeamento e estética" loading="lazy" />
          </div>
          <div className="preview-story-copy">
            <span>História da fundadora</span>
            <h2>A mulher por trás da Solare: cuidado, presença e <em>visão.</em></h2>
            <i />
            <p>Josy Leão criou a Solare para transformar bronzeamento em uma experiência de autoestima. Seu olhar está em cada detalhe: no desenho da marquinha, no cuidado com a pele, na escuta de cada cliente e no acolhimento de quem chega para se sentir mais bonita, segura e livre.</p>
            <strong>Mais que uma empresária da beleza, Josy conduz uma marca feita para realçar corpos reais, histórias reais e a luz de cada pessoa.</strong>
          </div>
        </section>

        <section id="servicos" className="preview-services">
          <div className="preview-section-head">
            <span>Serviços</span>
            <h2>Serviços para <em>realçar sua beleza.</em></h2>
          </div>
          <div className="preview-service-carousel">
            <div className="service-carousel-top">
              <button type="button" aria-label="Serviço anterior" disabled={servicePage === 0} onClick={() => goToServicePage(servicePage - servicesPerView)}>
                <ChevronLeft size={20} />
              </button>
              <button type="button" aria-label="Próximos serviços" disabled={servicePage === maxServicePage} onClick={() => goToServicePage(servicePage + servicesPerView)}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div
              className="preview-service-viewport"
              ref={serviceViewportRef}
              onScroll={(event) => {
                if (servicesPerView !== 1) return;
                const nextPage = Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth);
                if (nextPage !== servicePage) setServicePage(Math.max(0, Math.min(nextPage, maxServicePage)));
              }}
            >
              <div className="preview-service-track" style={{ transform: `translateX(-${serviceShift}%)` }}>
                {visibleServices.map((service, index) => (
                  <article className="preview-service-card" key={service.id}>
                    <div className="preview-service-image">
                      {(service.image_url || serviceImageFallback(index)) ? (
                        <img
                          src={service.image_url || serviceImageFallback(index)}
                          alt={service.name}
                          loading="lazy"
                          onError={(event) => {
                            const fallback = serviceImageFallback(index);
                            if (fallback && event.currentTarget.src !== new URL(fallback, window.location.origin).href) {
                              event.currentTarget.src = fallback;
                            }
                          }}
                        />
                      ) : (
                        <Sparkles size={36} strokeWidth={1.25} />
                      )}
                    </div>
                    <div className="preview-service-content">
                      <small>{String(index + 1).padStart(2, '0')} / Procedimento premium</small>
                      <h3>{service.name}</h3>
                      <p>{service.description || 'Atendimento personalizado para valorizar sua beleza com cuidado, conforto e acabamento premium.'}</p>
                      <strong>{money(service.price)} {service.duration ? <span>/ {service.duration}</span> : null}</strong>
                      <a className="service-whatsapp" href={buildWhatsAppUrl(settings.whatsapp, serviceWhatsAppMessage(service.name))} target="_blank" rel="noreferrer">Agendar pelo WhatsApp</a>
                    </div>
                    <i />
                  </article>
                ))}
              </div>
            </div>
            <div className="service-carousel-dots" aria-label="Paginação dos serviços">
              {Array.from({ length: servicePageCount }).map((_, index) => (
                <button
                  aria-label={`Ver página ${index + 1} de serviços`}
                  className={index === activeServiceDot ? 'active' : ''}
                  key={index}
                  type="button"
                  onClick={() => goToServicePage(index * servicesPerView)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="preview-bikini-correction">
          <div className="bikini-correction-media">
            <figure>
              <img src={mediaUrl('/brand/solare-correcao-01.jpg')} alt="Antes e depois de correção de biquíni com marquinha valorizada" loading="lazy" />
              <figcaption>Correção com valorização da cintura</figcaption>
            </figure>
            <figure>
              <img src={mediaUrl('/brand/solare-correcao-02.jpg')} alt="Resultado real de correção de biquíni para desenho de marquinha" loading="lazy" />
              <figcaption>Resultado real de marquinha redesenhada</figcaption>
            </figure>
          </div>
          <div className="bikini-correction-copy">
            <span>Especialidade Solare</span>
            <h2>Correção de biquíni para uma <em>marquinha mais elegante.</em></h2>
            <p>Ajuste técnico do desenho do biquíni para alinhar proporção, simetria e acabamento antes do bronze. Ideal para quem quer corrigir a marca, valorizar o corpo e conquistar um resultado mais limpo, feminino e natural.</p>
            <div className="bikini-correction-points">
              <span><CheckCircle2 size={16} /> Avaliação do desenho atual</span>
              <span><CheckCircle2 size={16} /> Ajuste da marquinha desejada</span>
              <span><CheckCircle2 size={16} /> Orientação para o bronze perfeito</span>
            </div>
            <a className="preview-primary" href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.correction)} target="_blank" rel="noreferrer">Quero corrigir minha marquinha</a>
          </div>
        </section>

        <section id="galeria" className="preview-gallery">
          <div className="preview-section-head">
            <span>Resultados</span>
            <h2>Resultados e experiências <em>reais</em></h2>
            <p>Registros de bronzeamento, cuidado e presença no espaço Josy Leão Solare.</p>
          </div>
          <div className="preview-bronze-showcase">
            <article className="bronze-video-card">
              <video controls playsInline muted preload="metadata">
                <source src={mediaUrl('/brand/video-bronze-01.mp4')} type="video/mp4" />
              </video>
              <div>
                <span>Vídeo real</span>
                <h3>Bronze em movimento, brilho e acabamento natural.</h3>
                <p>Um recorte curto da experiência para sentir o cuidado antes de reservar.</p>
              </div>
            </article>
            <div className="bronze-highlight-grid">
              {bronzeHighlights.map((item) => (
                <article key={item.src} className={item.frame}>
                  <img src={item.src} alt={`${item.title} - ${item.category}`} loading="lazy" />
                  <div><b>{item.title}</b><span>{item.category}</span></div>
                </article>
              ))}
            </div>
          </div>
          <div className="preview-section-actions">
            <a className="preview-secondary" href={officialInstagramUrl} target="_blank" rel="noreferrer">Ver resultados no Instagram</a>
            <a className="preview-primary" href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.bronze)} target="_blank" rel="noreferrer">Agendar pelo WhatsApp</a>
          </div>
        </section>

        <section className="preview-belonging">
          <div className="preview-belonging-media">
            <img src={mediaUrl('/brand/solare-bronze-lgbt-resultado.jpg')} alt="Resultado de bronze inclusivo no espaço Josy Leão Solare" loading="lazy" />
          </div>
          <div className="preview-belonging-copy">
            <span>Pertencimento</span>
            <h2>Beleza, liberdade e respeito caminham juntos.</h2>
            <p>Aqui, cada corpo, identidade e história são acolhidos com cuidado, segurança e profissionalismo.</p>
            <a className="preview-primary" href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.location)} target="_blank" rel="noreferrer">Conhecer pelo WhatsApp</a>
          </div>
        </section>

        <section id="produtos" className="preview-products">
          <div className="preview-section-head">
            <span>Produtos sexy shop</span>
            <h2>Vitrine discreta<br /><em>para consultar pelo WhatsApp.</em></h2>
          </div>
          <div className="preview-product-carousel">
            <div className="product-carousel-top">
              <button type="button" aria-label="Produto anterior" disabled={productPage === 0} onClick={() => goToProductPage(productPage - productsPerView)}>
                <ChevronLeft size={20} />
              </button>
              <button type="button" aria-label="Próximos produtos" disabled={productPage === maxProductPage} onClick={() => goToProductPage(productPage + productsPerView)}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div
              className="preview-product-viewport"
              ref={productViewportRef}
              onScroll={(event) => {
                if (productsPerView !== 1) return;
                const nextPage = Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth);
                if (nextPage !== productPage) setProductPage(Math.max(0, Math.min(nextPage, maxProductPage)));
              }}
            >
              <div className="preview-product-track" style={{ transform: `translateX(-${productShift}%)` }}>
                {visibleProducts.map((product, index) => (
                  <article className="preview-product-card" key={product.id}>
                    <div className="preview-product-image">
                      {(product.image_url || productImageFallback(index)) ? (
                        <img
                          src={product.image_url || productImageFallback(index)}
                          alt={product.name}
                          loading="lazy"
                          onError={(event) => {
                            const fallback = productImageFallback(index);
                            if (fallback && event.currentTarget.src !== new URL(fallback, window.location.origin).href) {
                              event.currentTarget.src = fallback;
                            }
                          }}
                        />
                      ) : <span>Imagem</span>}
                    </div>
                    <div>
                      <small>{String(index + 1).padStart(2, '0')} / {product.category || 'Produto'} / 18+</small>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <strong>{money(product.price)}</strong>
                      <a href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.sexyShop)} target="_blank" rel="noreferrer">Consultar no WhatsApp</a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="product-carousel-dots" aria-label="Paginação dos produtos">
              {Array.from({ length: productPageCount }).map((_, index) => (
                <button
                  aria-label={`Ver página ${index + 1} de produtos`}
                  className={index === activeProductDot ? 'active' : ''}
                  key={index}
                  type="button"
                  onClick={() => goToProductPage(index * productsPerView)}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="social" className="preview-social">
          <div className="preview-section-head">
            <span>Vídeos Solare</span>
            <h2>Bastidores, cabine e experiências <em>em movimento.</em></h2>
            <p>Uma rolagem leve com vídeos locais para mostrar o espaço, os procedimentos e a energia da marca.</p>
          </div>
          <div className="instagram-feature">
            <div>
              <Camera size={24} />
              <span>Instagram oficial</span>
              <h3>@josyleaooficial</h3>
              <p>Acompanhe resultados reais, bastidores do espaço, marquinhas, bronzeamento em Belém e novidades da agenda.</p>
            </div>
            <div className="instagram-feature-stats">
              <strong>12,8 mil</strong>
              <small>seguidores acompanhando a Solare</small>
            </div>
            <div className="instagram-feature-actions">
              <a className="preview-primary" href={officialInstagramUrl} target="_blank" rel="noreferrer">Ver Instagram</a>
              <a className="preview-secondary" href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.bronze)} target="_blank" rel="noreferrer">Agendar pelo WhatsApp</a>
            </div>
          </div>
          <div className="preview-social-grid">
            {socialMediaContent.map((item) => (
              <article className={item.featured ? 'featured' : ''} key={item.id}>
                <div className="preview-social-media">
                  {item.type === 'video' ? (
                    <video controls playsInline preload="metadata">
                      <source src={item.src} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={item.thumbnail || item.src} alt={`${item.category} - ${item.caption}`} loading="lazy" />
                  )}
                </div>
                <div>
                  <span>{item.category}</span>
                  <h3>{item.caption}</h3>
                  <div className="preview-social-actions">
                    {item.instagramUrl && <a href={item.instagramUrl} target="_blank" rel="noreferrer">Ver no Instagram</a>}
                    <a href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.bronze)} target="_blank" rel="noreferrer">Agendar pelo WhatsApp</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="preview-location">
          <span>Localização</span>
          <h2>{settings.address}</h2>
          <p className="preview-location-copy">Centro de bronzeamento e estética em Nazaré, Belém/PA, com atendimento acolhedor, discreto e especializado.</p>
          <div className="preview-location-actions">
            <a className="preview-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noreferrer">Abrir mapa</a>
            <a className="preview-primary" href={buildWhatsAppUrl(settings.whatsapp, ctaMessages.location)} target="_blank" rel="noreferrer">Como chegar pelo WhatsApp</a>
          </div>
        </section>

        <section id="agendamento" className="preview-booking">
          <div className="preview-booking-bg" aria-hidden="true" />
          <div className="preview-section-head">
            <span>Agendamento</span>
            <h2>Pronta para reservar<br /><em>seu horário?</em></h2>
          </div>
          <form className="preview-booking-form" onSubmit={handleAppointment}>
            <input required value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} placeholder="Nome" />
            <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="WhatsApp" />
            <select value={form.service_id} onChange={(event) => setForm({ ...form, service_id: event.target.value })}>
              {bookingOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
            <input type="date" value={form.preferred_date} onChange={(event) => setForm({ ...form, preferred_date: event.target.value })} />
            <select value={form.preferred_time} onChange={(event) => setForm({ ...form, preferred_time: event.target.value })}>
              <option value="">Horário desejado</option>
              {periods.map((period) => <option key={period}>{period}</option>)}
            </select>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Observações" />
            <button type="submit">Reservar meu horário</button>
          </form>
        </section>
      </main>

      <footer className="preview-footer">
        <div>
          <img src={settings.logo_url || fallbackSettings.logo_url || ''} alt="" />
          <h3>Josy Leão <em>Solare</em></h3>
        </div>
        <nav>
          <a href={officialInstagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={20} /></a>
          <a href={quickMessage} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>
        </nav>
        <p>{settings.address}</p>
        <i />
        <small>Copyright {new Date().getFullYear()} Josy Leão Solare. Todos os direitos reservados.</small>
      </footer>

      <a className="float-instagram" href={officialInstagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
        <Camera size={24} />
      </a>
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
        <h1>Gestão premium para bronzeamento e estética.</h1>
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
          setGallery(readDemoGallery());
          setSettings(readDemoSettings());
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
  const activeAppointments = appointments.filter((appointment) => appointment.status !== 'cancelado');
  const estimatedRevenue = appointments
    .filter((appointment) => appointment.status !== 'cancelado')
    .reduce((sum, appointment) => sum + Number(appointment.services?.price ?? 0), 0);
  const serviceDemand = appointments.reduce<Record<string, number>>((acc, appointment) => {
    const name = appointment.services?.name ?? 'Atendimento Solare';
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});
  const topService = Object.entries(serviceDemand).sort((a, b) => b[1] - a[1])[0]?.[0] ?? services[0]?.name ?? 'Bronzeamento';
  const statusSummary = [
    ['Novos', appointments.filter((appointment) => appointment.status === 'novo').length],
    ['Confirmados', appointments.filter((appointment) => appointment.status === 'confirmado').length],
    ['Realizados', appointments.filter((appointment) => appointment.status === 'realizado').length],
    ['Cancelados', appointments.filter((appointment) => appointment.status === 'cancelado').length],
  ];
  const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());

  return (
    <div className="studio-os">
      <aside className="studio-sidebar">
        <div>
          <p>Solare Studio OS</p>
          <h1>Josy Leão Solare</h1>
        </div>
        {[
          ['dashboard', LayoutDashboard, 'Dashboard'],
          ['agenda', CalendarDays, 'Agenda Inteligente'],
          ['crm', Users, 'CRM de Clientes'],
          ['products', Sparkles, 'Produtos Sexy Shop'],
          ['gallery', ImageUp, 'Galeria Antes e Depois'],
          ['services', Sparkles, 'Catálogo de Serviços'],
          ['testimonials', Heart, 'Depoimentos'],
          ['loyalty', Heart, 'Programa Fidelidade'],
          ['campaigns', MessageCircle, 'Campanhas WhatsApp'],
          ['settings', Settings, 'Configurações do Site'],
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
            <p>Centro de bronzeamento e estética</p>
            <h2>{moduleTitle(activeModule)}</h2>
          </div>
          <a href="/" target="_blank" rel="noreferrer">
            <Eye size={18} />
            Ver vitrine
          </a>
        </header>

        {activeModule === 'dashboard' && (
          <section className="dashboard-shell">
            <div className="dashboard-hero">
              <div>
                <span>Hoje, {todayLabel}</span>
                <h3>Visão rápida do Studio</h3>
                <p>Acompanhe agenda, clientes e oportunidades de retorno em uma leitura limpa para o dia de atendimento.</p>
              </div>
              <a href="#agenda" onClick={() => setActiveModule('agenda')}>Abrir agenda</a>
            </div>

            <div className="os-grid metric-grid">
              <Metric icon={<CalendarDays />} label="Agendamentos do dia" value={String(todayAppointments.length)} />
              <Metric icon={<Users />} label="Clientes da semana" value={String(weekClients.length)} />
              <Metric icon={<BarChart3 />} label="Receita estimada" value={money(estimatedRevenue)} />
              <Metric icon={<Sparkles />} label="Mais procurado" value={topService} />
            </div>

            <div className="dashboard-columns">
              <AppointmentsTable appointments={appointments.slice(0, 8)} reload={loadAdminData} />
              <aside className="dashboard-side">
                <article>
                  <span>Fila de atendimento</span>
                  <strong>{activeAppointments.length}</strong>
                  <p>agendamentos ativos no sistema</p>
                </article>
                <div className="status-summary">
                  {statusSummary.map(([label, value]) => (
                    <span key={label as string}><b>{value}</b>{label}</span>
                  ))}
                </div>
                <div className="recent-clients">
                  <h3>Clientes recentes</h3>
                  {(clients.length ? clients.slice(0, 4) : weekClients.slice(0, 4)).map((client) => (
                    <p key={client.id}><b>{client.name}</b><small>{client.last_procedure || 'Sem procedimento registrado'}</small></p>
                  ))}
                  {!clients.length && <p><b>Aguardando clientes</b><small>Os novos cadastros aparecerão aqui.</small></p>}
                </div>
              </aside>
            </div>
          </section>
        )}

        {activeModule === 'agenda' && <AgendaModule appointments={appointments} blocks={blocks} reload={loadAdminData} />}
        {activeModule === 'crm' && <CrmModule clients={clients} reload={loadAdminData} />}
        {activeModule === 'products' && <ProductsModule products={products} setProducts={setProducts} reload={loadAdminData} />}
        {activeModule === 'gallery' && <GalleryModule gallery={gallery} setGallery={setGallery} reload={loadAdminData} />}
        {activeModule === 'services' && <ServicesModule services={services} reload={loadAdminData} />}
        {activeModule === 'testimonials' && <TestimonialsModule testimonials={testimonials} reload={loadAdminData} />}
        {activeModule === 'loyalty' && <LoyaltyModule clients={clients} reload={loadAdminData} />}
        {activeModule === 'campaigns' && <CampaignsModule clients={clients} services={services} />}
        {activeModule === 'settings' && <SettingsModule settings={settings} setSettings={setSettings} reload={loadAdminData} />}
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
    services: 'Catálogo de Serviços',
    testimonials: 'Depoimentos',
    loyalty: 'Programa Fidelidade',
    campaigns: 'Campanhas WhatsApp',
    settings: 'Configurações do Site',
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
      <div className="panel-title">
        <span>Operação</span>
        <h3>Agendamentos recebidos</h3>
      </div>
      <div className="os-table">
        <div className="os-table-head">
          <span>Cliente</span>
          <span>Interesse</span>
          <span>Data e período</span>
          <span>Status</span>
        </div>
        {appointments.map((appointment) => (
          <div key={appointment.id}>
            <span>{appointment.client_name}</span>
            <span>{appointment.services?.name ?? 'Serviço'}</span>
            <span>{appointment.preferred_date} - {appointment.preferred_time}</span>
            <label className={`status-select status-${appointment.status}`}>
              <i />
              <select value={appointment.status} onChange={(event) => void updateStatus(appointment.id, event.target.value as Appointment['status'])}>
                {statusList.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>
        ))}
        {!appointments.length && (
          <article className="empty-state">
            <CalendarDays size={22} />
            <strong>Nenhum agendamento recebido ainda.</strong>
            <p>Quando uma cliente preencher o formulário da vitrine, o pedido aparecerá aqui.</p>
          </article>
        )}
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
    <section className="agenda-layout">
      <div className="agenda-panel">
        <div className="panel-title">
          <span>Próximos 14 dias</span>
          <h3>Calendário de atendimentos</h3>
        </div>
        <div className="calendar-board">
        {Array.from({ length: 14 }).map((_, index) => {
          const day = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
          const date = day.toISOString().slice(0, 10);
          const count = appointments.filter((appointment) => appointment.preferred_date === date).length;
          const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day).replace('.', '');
          return (
            <article key={date} className={count ? 'has-appointments' : ''}>
              <small>{weekday}</small>
              <strong>{date.slice(8)}/{date.slice(5, 7)}</strong>
              <span>{count ? `${count} agendamento${count > 1 ? 's' : ''}` : 'Livre'}</span>
            </article>
          );
        })}
        </div>
      </div>

      <form className="os-form agenda-block-form" onSubmit={addBlock}>
        <div className="panel-title">
          <span>Controle da agenda</span>
          <h3>Bloqueio de horários</h3>
        </div>
        <div className="agenda-form-grid">
          <label>
            <span>Data</span>
            <input type="date" value={block.block_date} onChange={(event) => setBlock({ ...block, block_date: event.target.value })} />
          </label>
          <label>
            <span>Início</span>
            <input placeholder="09:00" value={block.start_time} onChange={(event) => setBlock({ ...block, start_time: event.target.value })} />
          </label>
          <label>
            <span>Fim</span>
            <input placeholder="12:00" value={block.end_time} onChange={(event) => setBlock({ ...block, end_time: event.target.value })} />
          </label>
        </div>
        <label>
          <span>Motivo</span>
          <textarea placeholder="Ex.: manutenção, almoço, atendimento externo..." value={block.reason} onChange={(event) => setBlock({ ...block, reason: event.target.value })} />
        </label>
        <button><Plus size={16} /> Bloquear horario</button>
        <div className="block-list">
          {blocks.map((item) => (
            <small key={item.id}>
              <b>{item.block_date}</b>
              <span>{item.start_time} - {item.end_time}</span>
              <em>{item.reason || 'Sem motivo informado'}</em>
            </small>
          ))}
          {!blocks.length && <p>Nenhum horário bloqueado por enquanto.</p>}
        </div>
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <section className="module-grid admin-editor-layout">
      <form className="os-form admin-editor-form" onSubmit={save}>
            <h3>{editingId ? 'Editar produto' : 'Novo produto do catálogo'}</h3>
        <p className="admin-help-text">Escolha uma foto, confira a prévia e salve. Para trocar imagem de um produto existente, clique em Editar na lista.</p>
        <div className="admin-image-preview compact">
          {product.image_url ? <img src={product.image_url} alt={product.name || 'Prévia do produto'} /> : <ImageUp size={34} />}
        </div>
        <input required placeholder="Nome do produto" value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} />
        <input placeholder="Preço" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} />
        <select value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })}>
          {productCategories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <label className="file-field">
          <ImageUp size={16} />
          {uploading ? 'Enviando imagem...' : product.image_url ? 'Trocar foto do produto' : 'Escolher foto do produto'}
          <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0])} />
        </label>
        <input placeholder="URL da imagem" value={product.image_url} onChange={(event) => setProduct({ ...product, image_url: event.target.value })} />
        <textarea placeholder="Descrição e informações do produto" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} />
        <button><CheckCircle2 size={16} /> {editingId ? 'Salvar produto' : 'Adicionar produto'}</button>
      </form>
      <div className="product-admin-list">
        <div className="admin-list-head">
          <span>{products.length} produtos</span>
          <h3>Produtos cadastrados</h3>
          <p>Clique em editar para trocar foto, texto, preço ou status.</p>
        </div>
        {products.map((item) => (
          <article className={editingId === item.id ? 'editing' : ''} key={item.id}>
            {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div />}
            <section>
              <span>{item.category}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <strong>{money(item.price)}</strong>
            </section>
            <div className="admin-row-actions">
              <button onClick={() => edit(item)}><Pencil size={16} /> Editar</button>
              <button onClick={() => void toggle(item)}>{item.active ? 'Visível' : 'Oculto'}</button>
              <button className="danger" onClick={() => void remove(item.id)}><Trash2 size={16} /> Excluir</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GalleryModule({ gallery, setGallery, reload }: { gallery: GalleryItem[]; setGallery: (gallery: GalleryItem[]) => void; reload: () => Promise<void> }) {
  const [item, setItem] = useState({ title: '', image_url: '', category: categories[0], active: true });
  const [uploading, setUploading] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      const nextItem: GalleryItem = {
        id: `gallery-${Date.now()}`,
        title: item.title || 'Foto Solare',
        image_url: item.image_url,
        category: item.category,
        active: item.active,
        created_at: new Date().toISOString(),
      };
      const nextGallery = [nextItem, ...gallery];
      setGallery(nextGallery);
      saveDemoGallery(nextGallery);
      setItem({ title: '', image_url: '', category: categories[0], active: true });
      return;
    }
    await supabase.from('gallery').insert(item);
    setItem({ title: '', image_url: '', category: categories[0], active: true });
    await reload();
  }

  async function toggle(id: string, active: boolean) {
    if (!supabase) {
      const nextGallery = gallery.map((photo) => (photo.id === id ? { ...photo, active: !active } : photo));
      setGallery(nextGallery);
      saveDemoGallery(nextGallery);
      return;
    }
    await supabase.from('gallery').update({ active: !active }).eq('id', id);
    await reload();
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = supabase ? await uploadMedia(file, 'gallery') : await fileToDataUrl(file);
      setItem((current) => ({ ...current, image_url: imageUrl }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="module-grid">
      <form className="os-form" onSubmit={save}>
        <h3>Upload por categoria</h3>
        <p className="admin-help-text">Escolha a foto, veja a prévia e publique na galeria. No modo demo, fica salvo neste navegador.</p>
        <div className="admin-image-preview compact">
          {item.image_url ? <img src={item.image_url} alt={item.title || 'Prévia da galeria'} /> : <ImageUp size={34} />}
        </div>
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
  const emptyService = { name: '', description: '', price: '', duration: '', image_url: '', active: true };
  const [service, setService] = useState(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const payload = { ...service, price: service.price ? Number(service.price) : null };
    if (editingId) {
      await supabase.from('services').update(payload).eq('id', editingId);
    } else {
      await supabase.from('services').insert(payload);
    }
    setService(emptyService);
    setEditingId(null);
    await reload();
  }

  function edit(item: Service) {
    setEditingId(item.id);
    setService({
      name: item.name,
      description: item.description ?? '',
      price: item.price ? String(item.price) : '',
      duration: item.duration ?? '',
      image_url: item.image_url ?? '',
      active: item.active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setService(emptyService);
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
        <h3>{editingId ? 'Editar procedimento' : 'Catalogo de procedimentos'}</h3>
        <div className="admin-image-preview compact">
          {service.image_url ? <img src={service.image_url} alt={service.name || 'Previa do servico'} /> : <ImageUp size={34} />}
        </div>
        <input placeholder="Nome" value={service.name} onChange={(event) => setService({ ...service, name: event.target.value })} />
        <input placeholder="Preco" value={service.price} onChange={(event) => setService({ ...service, price: event.target.value })} />
        <input placeholder="Tempo medio" value={service.duration} onChange={(event) => setService({ ...service, duration: event.target.value })} />
        <label className="file-field">
          <ImageUp size={16} />
          {uploading ? 'Enviando imagem...' : 'Enviar imagem do servico'}
          <input type="file" accept="image/*" onChange={(event) => void handleUpload(event.target.files?.[0])} />
        </label>
        <input placeholder="URL da imagem" value={service.image_url} onChange={(event) => setService({ ...service, image_url: event.target.value })} />
        <textarea placeholder="Descricao" value={service.description} onChange={(event) => setService({ ...service, description: event.target.value })} />
        <label className="admin-check">
          <input type="checkbox" checked={service.active} onChange={(event) => setService({ ...service, active: event.target.checked })} />
          Exibir servico na vitrine
        </label>
        <button><Plus size={16} /> {editingId ? 'Salvar alteracoes' : 'Adicionar servico'}</button>
        {editingId && <button type="button" className="ghost-action" onClick={cancelEdit}>Cancelar edicao</button>}
      </form>
      <div className="service-admin-list">
        {services.map((item) => (
          <article key={item.id}>
            {item.image_url ? <img src={item.image_url} alt={item.name} /> : <Sparkles size={18} />}
            <div>
              <h3>{item.name}</h3>
              <p>{money(item.price)} - {item.duration || 'tempo sob consulta'}{item.active ? '' : ' / oculto'}</p>
            </div>
            <button onClick={() => edit(item)}><Pencil size={16} /></button>
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
  const message = `Olá! A Josy Leão Solare está com horários para ${services[0]?.name ?? 'atendimento premium'}. Quer reservar seu momento Solare?`;

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

function SettingsModule({ settings, setSettings, reload }: { settings: BusinessSettings; setSettings: (settings: BusinessSettings) => void; reload: () => Promise<void> }) {
  const [draft, setDraft] = useState(settings);
  const [uploading, setUploading] = useState('');

  useEffect(() => setDraft(settings), [settings]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setSettings(draft);
      saveDemoSettings(draft);
      return;
    }
    await supabase.from('settings').upsert(draft);
    await reload();
  }

  async function handleUpload(file: File | undefined, field: 'logo_url' | 'hero_image_url') {
    if (!file) return;
    setUploading(field);
    try {
      const imageUrl = supabase ? await uploadMedia(file, 'settings') : await fileToDataUrl(file);
      setDraft((current) => ({ ...current, [field]: imageUrl }));
    } finally {
      setUploading('');
    }
  }

  return (
    <form className="os-form settings-form" onSubmit={save}>
      <h3>Configurações do site</h3>
      <p className="admin-help-text">Troque logo, WhatsApp, Instagram e endereço. No modo demo, as mudanças ficam salvas neste navegador.</p>
      <div className="settings-preview-grid">
        <div className="admin-image-preview small">
          {draft.logo_url ? <img src={draft.logo_url} alt="Prévia da logo" /> : <ImageUp size={28} />}
          <span>Logo atual</span>
        </div>
        <div className="admin-image-preview small">
          {draft.hero_image_url ? <img src={draft.hero_image_url} alt="Prévia da imagem principal" /> : <ImageUp size={28} />}
          <span>Imagem principal</span>
        </div>
      </div>
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

