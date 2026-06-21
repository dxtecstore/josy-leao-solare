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
    id: 'destaque-marquinha',
    type: 'image',
    src: '/brand/solare-bronze-07.jpg?v=20260620d',
    caption: 'Resultado Solare Skin em um registro de alto impacto.',
    category: 'Resultado real',
    instagramUrl: 'https://www.instagram.com/reel/DVqgd-Tji2L/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    featured: true,
  },
  {
    id: 'campanha-solare',
    type: 'image',
    src: '/brand/solare-bronze-chora-boy.png?v=20260620d',
    caption: 'Campanha visual com presença, brilho e identidade da marca.',
    category: 'Campanha',
    instagramUrl: 'https://www.instagram.com/reel/DVgsdaiDkMR/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
  },
  {
    id: 'bastidor-josy',
    type: 'image',
    src: '/brand/resultado-real-02.jpg?v=20260620d',
    caption: 'Detalhes do espaço e do cuidado que fazem parte da experiência.',
    category: 'Bastidores',
    instagramUrl: 'https://www.instagram.com/reel/DVcZKPxANGP/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
  },
  {
    id: 'correcao-biquini',
    type: 'image',
    src: '/brand/solare-lgbt-01.jpg?v=20260620d',
    caption: 'Um espaço pensado para acolher corpos, histórias e identidades.',
    category: 'Pertencimento',
    instagramUrl: 'https://www.instagram.com/reel/DVrsgJrgDA_/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
  },
];
