import type { GalleryItem, Product, Service, Settings, Testimonial } from '../lib/supabase';

export const fallbackSettings: Settings = {
  id: 'default',
  business_name: 'Josy Leao Solare',
  whatsapp: '5591986302070',
  instagram: 'https://www.instagram.com/josyleaosolare/',
  address: 'Av. Alcindo Cacela, 1474 - Nazare - Belem/PA',
  logo_url: '/brand/josy-logo-official.webp',
  hero_image_url: '/brand/glow-01.jpg',
};

export const fallbackServices: Service[] = [
  {
    id: 'natural',
    name: 'Bronzeamento Natural',
    description: 'Sua pele, sua luz, sua melhor versao.',
    price: 180,
    duration: '60 min',
    image_url: '/brand/glow-01.jpg',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fita',
    name: 'Bronzeamento com Fita',
    description: 'Marquinha personalizada com acabamento delicado.',
    price: 220,
    duration: '90 min',
    image_url: '/brand/resultado-real-02.jpg',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'lua',
    name: 'Banho de Lua',
    description: 'Pele iluminada com toque suave e feminino.',
    price: 150,
    duration: '75 min',
    image_url: '/brand/banho-lua-01.jpg',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'corporal',
    name: 'Estetica Corporal',
    description: 'Cuidado com o corpo, contorno e autoestima.',
    price: 190,
    duration: '60 min',
    image_url: '/brand/marquinha-01.jpg',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'facial',
    name: 'Estetica Facial',
    description: 'Tratamentos delicados para glow, textura e luminosidade.',
    price: 170,
    duration: '60 min',
    image_url: '/brand/resultado-real-01.jpg',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sobrancelhas',
    name: 'Design de Sobrancelhas',
    description: 'Acabamento preciso para valorizar a expressao do rosto.',
    price: 90,
    duration: '40 min',
    image_url: '/brand/verao-01.jpg',
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const fallbackGallery: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Glow Solare',
    image_url: '/brand/glow-01.jpg',
    category: 'Bronze',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g2',
    title: 'Pele Dourada',
    image_url: '/brand/resultado-real-01.jpg',
    category: 'Bronze',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g3',
    title: 'Marquinha Premium',
    image_url: '/brand/resultado-real-02.jpg',
    category: 'Marquinha',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g4',
    title: 'Banho de Lua',
    image_url: '/brand/banho-lua-01.jpg',
    category: 'Estetica corporal',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g5',
    title: 'Detalhe Solare',
    image_url: '/brand/marquinha-01.jpg',
    category: 'Marquinha',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'g6',
    title: 'Verao Dourado',
    image_url: '/brand/verao-01.jpg',
    category: 'Bronze',
    active: true,
    created_at: new Date().toISOString(),
  },
];

const productImages = [
  '/brand/glow-01.jpg',
  '/brand/resultado-real-01.jpg',
  '/brand/resultado-real-02.jpg',
  '/brand/banho-lua-01.jpg',
  '/brand/marquinha-01.jpg',
  '/brand/verao-01.jpg',
];

export const fallbackProducts: Product[] = [
  'Body Sensual Premium',
  'Conjunto Renda Luxo',
  'Perfume Intimo Glow',
  'Gel Beijavel',
  'Vela Aromatica Corporal',
  'Massageador Deluxe',
  'Lubrificante Premium',
  'Kit Noite Especial',
  'Body Chain Dourado',
  'Meia 7/8 Renda',
  'Espuma de Banho Sensual',
  'Oleo Corporal Iluminador',
  'Lingerie Strappy',
  'Chicote Soft',
  'Venda de Cetim',
  'Algema Aveludada',
  'Presente Surpresa Sexy',
].map((name, index) => ({
  id: `product-${index + 1}`,
  name,
  description: 'Produto selecionado para uma experiencia elegante, discreta e premium.',
  price: 79 + index * 12,
  image_url: productImages[index % productImages.length],
  category: index < 6 ? 'Lingerie' : index < 12 ? 'Cosmeticos' : 'Acessorios',
  active: true,
  created_at: new Date().toISOString(),
}));

export const fallbackTestimonials: Testimonial[] = [
  {
    id: 't1',
    client_name: 'Cliente Solare',
    text: 'Mais que bronzeamento: uma experiencia de autoestima.',
    image_url: '/brand/resultado-real-01.jpg',
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const benefits = [
  'Marquinha personalizada',
  'Pele iluminada',
  'Atendimento feminino',
  'Ambiente confortavel',
  'Resultado natural',
  'Experiencia premium',
];
