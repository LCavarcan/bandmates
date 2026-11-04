import type { GenreId, ShowTier, VenueId } from '../engine/types';

export interface VenueDef {
  id: VenueId;
  name: string;
  icon: string;
  description: string;
  capacity: number;
  /** Cachê fixo de referência (ajustado pela nota do show). */
  fee: number;
  /** Parte da bilheteria por pessoa no público. */
  perHead: number;
  minFans: number;
  minReputation: number;
  /** Gêneros que o público da casa prefere. */
  genres: GenreId[];
  fanFactor: number;
  repFactor: number;
  /** Semanas de espera antes de tocar de novo na mesma casa. */
  cooldown: number;
  /** Casas especiais não aparecem na lista de agendamento. */
  special?: boolean;
}

export const VENUE_ORDER: VenueId[] = ['bar', 'porao', 'calourada', 'aurora'];

export const VENUES: Record<VenueId, VenueDef> = {
  bar: {
    id: 'bar',
    name: 'Bar do Zé',
    icon: '🍺',
    description: 'Boteco com palco de paletes. Ninguém veio pela música, mas todo mundo fica.',
    capacity: 40,
    fee: 150,
    perHead: 4,
    minFans: 0,
    minReputation: 0,
    genres: ['punk', 'indie'],
    fanFactor: 1,
    repFactor: 0.5,
    cooldown: 2,
  },
  porao: {
    id: 'porao',
    name: 'Porão Cultural Mangue',
    icon: '🕯️',
    description: 'Centro cultural independente. Público atento, que respeita música autoral.',
    capacity: 90,
    fee: 200,
    perHead: 5,
    minFans: 60,
    minReputation: 8,
    genres: ['alternativo', 'indie'],
    fanFactor: 1.1,
    repFactor: 1.2,
    cooldown: 2,
  },
  calourada: {
    id: 'calourada',
    name: 'Calourada da Federal',
    icon: '🎓',
    description: 'Festa enorme, som duvidoso. Muitos fãs novos; a crítica não vai.',
    capacity: 220,
    fee: 250,
    perHead: 3,
    minFans: 110,
    minReputation: 0,
    genres: ['pop', 'punk'],
    fanFactor: 1.3,
    repFactor: 0.6,
    cooldown: 3,
  },
  aurora: {
    id: 'aurora',
    name: 'Casa Aurora',
    icon: '🌅',
    description: 'A casa de shows indie da cidade. Tocar aqui é ser levada a sério.',
    capacity: 160,
    fee: 400,
    perHead: 6,
    minFans: 180,
    minReputation: 20,
    genres: ['indie', 'alternativo', 'pop'],
    fanFactor: 1.2,
    repFactor: 1.5,
    cooldown: 3,
  },
  festival: {
    id: 'festival',
    name: 'Seletiva do Festival Maré Alta',
    icon: '🌊',
    description: 'Dez bandas, um júri, uma vaga. Semana 12.',
    capacity: 300,
    fee: 0,
    perHead: 0,
    minFans: 0,
    minReputation: 0,
    genres: ['indie', 'pop', 'alternativo', 'punk'],
    fanFactor: 1.5,
    repFactor: 2,
    cooldown: 99,
    special: true,
  },
};

export const SHOW_TIERS: Record<ShowTier, { label: string; min: number; lines: string[] }> = {
  memoravel: {
    label: 'Noite memorável',
    min: 75,
    lines: [
      'No último refrão, o público cantou mais alto que a Júlia. Ninguém na banda esperava isso.',
      'Pediram bis duas vezes. Na segunda, vocês não tinham mais música — tocaram a primeira de novo, e ninguém se importou.',
    ],
  },
  bom: {
    label: 'Bom show',
    min: 58,
    lines: ['Um show redondo. Gente balançando a cabeça, alguns celulares filmando, aplausos sinceros.', 'Não foi perfeito, mas foi de verdade. Três pessoas vieram falar com a banda depois.'],
  },
  morno: {
    label: 'Show morno',
    min: 42,
    lines: ['O público conversou durante metade do show. Na outra metade, prestou atenção.', 'Alguns acertos, alguns tropeços. O dono da casa disse “valeu, meninas” sem olhar para cima.'],
  },
  desastre: {
    label: 'Desastre',
    min: 0,
    lines: ['O som falhou, uma corda arrebentou, e a Bia perdeu a baqueta no meio da música mais rápida.', 'Ninguém da banda se olhou no fim do show. A volta para casa foi em silêncio.'],
  },
};

/** Nota de uma faixa cover no setlist (sem originalidade, sem identidade). */
export const COVER_VALUE = 45;
export const SETLIST_SIZE = 4;
