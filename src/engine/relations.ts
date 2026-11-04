import { MEMBERS } from '../data/members';
import type { PairTone } from '../data/pairs';
import type { ActivityId, MemberId, Relation, RelationKey } from './types';
import { clamp } from './util';

export function relationKey(a: MemberId, b: MemberId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getRelation(relations: Record<string, Relation>, a: MemberId, b: MemberId): Relation {
  return relations[relationKey(a, b)];
}

export function applyRelationDelta(
  relations: Record<string, Relation>,
  a: MemberId,
  b: MemberId,
  delta: Partial<Relation>,
): void {
  const key = relationKey(a, b);
  const rel = { ...relations[key] };
  for (const k of Object.keys(delta) as RelationKey[]) {
    rel[k] = clamp(rel[k] + (delta[k] ?? 0), -100, 100);
  }
  relations[key] = rel;
}

/** "Química" de trabalho de uma dupla: positiva ajuda, negativa atrapalha. */
export function synergy(rel: Relation): number {
  return (rel.afinidade + rel.respeito + rel.confianca) / 3 - rel.rivalidade / 2;
}

/**
 * Decide o tom de uma interação em dupla e a mudança na relação.
 * Regras simples e legíveis, baseadas em traços + relação atual (ver docs/FORMULAS.md).
 */
export function pairInteraction(
  a: MemberId,
  b: MemberId,
  activity: ActivityId,
  rel: Relation,
): { tone: PairTone; delta: Partial<Relation> } {
  const ta = MEMBERS[a].traits;
  const tb = MEMBERS[b].traits;
  const t = (traits: typeof ta, k: keyof typeof ta) => traits[k] ?? 0;

  const bothCompetitive = t(ta, 'competitividade') >= 60 && t(tb, 'competitividade') >= 60;
  const oneCompetitive = t(ta, 'competitividade') >= 60 || t(tb, 'competitividade') >= 60;
  const perfVsImpulse =
    (t(ta, 'perfeccionismo') >= 70 && t(tb, 'impulsividade') >= 60) ||
    (t(tb, 'perfeccionismo') >= 70 && t(ta, 'impulsividade') >= 60);
  const bothCreative = t(ta, 'criatividade') >= 60 && t(tb, 'criatividade') >= 60;

  if (activity === 'descansar') {
    // Fora do trabalho, as diferenças pesam menos.
    if (rel.rivalidade >= 40) return { tone: 'faisca', delta: { afinidade: 2, rivalidade: 1 } };
    if (rel.afinidade < -10) return { tone: 'atrito', delta: { afinidade: 1 } };
    return { tone: 'harmonia', delta: { afinidade: 4, confianca: 2 } };
  }

  // Perfeccionismo contra impulsividade gera atrito no trabalho técnico (ensaio, composição, gravação).
  if (perfVsImpulse && (activity === 'ensaiar' || activity === 'compor' || activity === 'gravar')) {
    if (rel.respeito >= 35) {
      // Com respeito suficiente, o atrito vira aprendizado.
      return { tone: 'faisca', delta: { respeito: 3, rivalidade: 1 } };
    }
    return { tone: 'atrito', delta: { afinidade: -3, confianca: -1, respeito: 1 } };
  }

  // Duas pessoas criativas compondo: tensão produtiva.
  if (bothCreative && activity === 'compor') {
    return { tone: 'faisca', delta: { respeito: 3, rivalidade: 2 } };
  }

  // Competição alimenta rivalidade — mas também respeito.
  if (bothCompetitive || (oneCompetitive && rel.rivalidade >= 20)) {
    return { tone: 'faisca', delta: { rivalidade: 3, respeito: 2 } };
  }

  if (synergy(rel) >= 15) {
    return { tone: 'harmonia', delta: { afinidade: 3, confianca: 2, respeito: 1 } };
  }
  if (synergy(rel) < -10) {
    return { tone: 'atrito', delta: { afinidade: -1, rivalidade: 1 } };
  }
  return { tone: 'neutro', delta: { afinidade: 1, respeito: 1, confianca: 1 } };
}

/** Rótulo legível de uma relação, para a interface não depender de números. */
export function describeRelation(rel: Relation): { label: string; tone: 'boa' | 'tensa' | 'mista' | 'neutra' } {
  const { afinidade, respeito, confianca, rivalidade } = rel;
  if (rivalidade >= 40 && respeito >= 35) return { label: 'Rivais que se admiram', tone: 'mista' };
  if (rivalidade >= 40) return { label: 'Rivalidade acesa', tone: 'tensa' };
  if (afinidade >= 50 && confianca >= 40) return { label: 'Amizade sólida', tone: 'boa' };
  if (afinidade <= -20) return { label: 'Atrito', tone: 'tensa' };
  if (respeito >= 40 && afinidade < 20) return { label: 'Respeito profissional', tone: 'mista' };
  if (afinidade >= 30) return { label: 'Afinidade crescendo', tone: 'boa' };
  if (rivalidade >= 20) return { label: 'Competição velada', tone: 'mista' };
  if (confianca <= 5 && afinidade <= 10) return { label: 'Ainda se conhecendo', tone: 'neutra' };
  return { label: 'Colegas de banda', tone: 'neutra' };
}
