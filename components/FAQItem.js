import { useState } from 'react';

export default function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const answerId = `answer-${question.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <article className="border-b border-gray-200 py-5">
      <h2>
        <button className="flex w-full items-center justify-between gap-4 text-left text-lg font-semibold text-brand" type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setOpen((value) => !value)}>
          {question}
          <span aria-hidden="true" className="text-2xl font-normal">{open ? '−' : '+'}</span>
        </button>
      </h2>
      {open && <p id={answerId} className="mt-3 max-w-3xl leading-7 text-gray-700">{answer}</p>}
    </article>
  );
}
