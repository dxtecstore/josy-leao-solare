export type SocialMediaContent = {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  caption: string;
  category: string;
  instagramUrl?: string;
  featured?: boolean;
};

export const socialMediaContent: SocialMediaContent[] = [
  {
    id: 'reinauguracao',
    type: 'video',
    src: '/videos/reinauguracao.mp4?v=20260622a',
    thumbnail: '/brand/solare-resultado-casal.jpg?v=20260622b',
    caption: 'A nova fase da Josy Leão Solare em um registro cheio de presença.',
    category: 'Reinauguração',
    featured: true,
  },
  {
    id: 'cabine',
    type: 'video',
    src: '/videos/video-cabine.mp4?v=20260622a',
    thumbnail: '/brand/solare-bronze-02.jpg?v=20260622a',
    caption: 'Bronze de cabine com tecnologia, conforto e resultado desde a primeira sessão.',
    category: 'Bronze de cabine',
  },
  {
    id: 'centro',
    type: 'video',
    src: '/videos/centro-bronzeamento-estetica.mp4?v=20260622a',
    thumbnail: '/brand/josy-storytelling.png?v=20260622a',
    caption: 'Um centro de bronzeamento e estética pensado para cuidar de cada detalhe.',
    category: 'Espaço Solare',
  },
  {
    id: 'amor-proprio',
    type: 'video',
    src: '/videos/amor-proprio.mp4?v=20260622a',
    thumbnail: '/brand/solare-bronze-lgbt-resultado.jpg?v=20260622b',
    caption: 'Beleza também é amor próprio, liberdade e conexão com o próprio corpo.',
    category: 'Autoestima',
  },
  {
    id: 'banho-de-lua',
    type: 'video',
    src: '/videos/banho-de-lua.mp4?v=20260622a',
    thumbnail: '/brand/banho-lua-01.jpg?v=20260622a',
    caption: 'Banho de lua e cuidado corporal para uma pele mais iluminada.',
    category: 'Banho de lua',
  },
];
