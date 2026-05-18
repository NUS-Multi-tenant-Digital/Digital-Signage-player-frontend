import { playerUseCases } from '../data/useCases';

export default function UseCaseSwitcher({ activeCase, onChange }) {
  return (
    <div className="use-case-switcher">
      {playerUseCases.map((item) => (
        <button
          className={activeCase === item.id ? 'use-case-card active' : 'use-case-card'}
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
        >
          <span>{item.label}</span>
          <strong>{item.title}</strong>
          <small>{item.description}</small>
        </button>
      ))}
    </div>
  );
}
