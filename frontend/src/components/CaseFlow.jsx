import { playerUseCases } from '../data/useCases';

export default function CaseFlow({ activeCase }) {
  const current = playerUseCases.find((item) => item.id === activeCase);

  if (!current) return null;

  return (
    <div className="case-flow">
      <div>
        <span className="eyebrow">{current.label}</span>
        <strong>{current.title}</strong>
      </div>
      <ol>
        {current.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
