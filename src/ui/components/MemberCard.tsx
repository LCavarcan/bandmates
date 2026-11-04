import { useState, type CSSProperties } from 'react';
import { ACTIVITIES, ACTIVITY_ORDER } from '../../data/activities';
import { EMOTION_LABELS, SKILL_LABELS, TRAIT_LABELS } from '../../data/labels';
import { MEMBERS } from '../../data/members';
import { BURNOUT_STRESS } from '../../engine';
import type { ActivityId, MemberState, SkillKey, TraitKey } from '../../engine/types';
import { MOOD_LABELS, moodOf, Portrait } from '../art/Portrait';
import { Meter } from './Meter';

interface Props {
  member: MemberState;
  activity: ActivityId;
  disabled: boolean;
  /** Atividades indisponíveis nesta semana, com o motivo. */
  unavailable?: Partial<Record<ActivityId, string>>;
  onChoose: (a: ActivityId) => void;
  /** Ausente = conversa indisponível nesta semana. */
  onTalk?: () => void;
}

export function MemberCard({ member, activity, disabled, unavailable = {}, onChoose, onTalk }: Props) {
  const p = MEMBERS[member.id];
  const mood = moodOf(member);
  const [showProfile, setShowProfile] = useState(false);
  const traits = (Object.entries(p.traits) as [TraitKey, number][]).filter(([, v]) => v >= 60);
  const burnt = member.emotions.estresse >= BURNOUT_STRESS;

  return (
    <article className="member" style={{ '--c': p.color } as CSSProperties}>
      <header className="member__head">
        <div className="member__portrait">
          <Portrait profile={p} mood={mood} size={118} />
        </div>
        <div className="member__id">
          <h3>{p.name}</h3>
          <p className="member__role">{p.role}</p>
          <span className={`mood mood--${mood}`}>{MOOD_LABELS[mood]}</span>
          {burnt && <span className="mood mood--burnt">Esgotada</span>}
          <div className="traits">
            {traits.map(([k]) => (
              <span key={k} className="trait">{TRAIT_LABELS[k]}</span>
            ))}
          </div>
        </div>
      </header>

      {showProfile ? (
        <div className="member__profile">
          <p className="quote">{p.tagline}</p>
          <p>{p.bio}</p>
          <p><strong>Quer:</strong> {p.wants}</p>
          <p><strong>Teme:</strong> {p.fears}</p>
          <p><strong>Ouve:</strong> {p.musicalTaste}</p>
        </div>
      ) : (
        <div className="member__stats">
          <div className="stat-group">
            <Meter label={EMOTION_LABELS.motivacao} value={member.emotions.motivacao} />
            <Meter label={EMOTION_LABELS.estresse} value={member.emotions.estresse} inverse />
            <Meter label={EMOTION_LABELS.confianca} value={member.emotions.confianca} />
          </div>
          <div className="skills">
            {(Object.keys(SKILL_LABELS) as SkillKey[]).map((k) => (
              <div key={k} className="skill" title={`${SKILL_LABELS[k]}: ${member.skills[k]}`}>
                <span className="skill__value">{member.skills[k]}</span>
                <span className="skill__label">{SKILL_LABELS[k]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="member__actions">
        <button className="link-btn" onClick={() => setShowProfile((v) => !v)}>
          {showProfile ? '← Ver atributos' : 'Conhecer ' + p.name + ' →'}
        </button>
        <button
          className="talk-btn"
          onClick={onTalk}
          disabled={!onTalk}
          title={onTalk ? `Conversar com ${p.name} (uma conversa por semana)` : 'Você já conversou com alguém nesta semana.'}
        >
          💬 Conversar
        </button>
      </div>

      <div className="activities" role="radiogroup" aria-label={`Atividade de ${p.name}`}>
        {ACTIVITY_ORDER.map((id) => {
          const a = ACTIVITIES[id];
          const selected = id === activity;
          const blocked = unavailable[id];
          return (
            <button
              key={id}
              role="radio"
              aria-checked={selected}
              disabled={disabled || (!!blocked && !selected)}
              className={`activity ${selected ? 'activity--on' : ''} ${blocked && selected ? 'activity--blocked' : ''}`}
              onClick={() => onChoose(id)}
              title={blocked ?? a.description}
            >
              <span className="activity__icon" aria-hidden="true">{a.icon}</span>
              <span className="activity__name">{a.name}</span>
            </button>
          );
        })}
      </div>
      <p className={`activity-hint ${unavailable[activity] ? 'activity-hint--warn' : ''}`}>
        {unavailable[activity] ?? ACTIVITIES[activity].description}
      </p>
    </article>
  );
}
