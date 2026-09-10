import { ArrowRight, Inbox } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) => {
  const content = (
    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition-all duration-200 hover:border-slate-300 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          {icon ?? <Inbox className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-[-0.03em] text-slate-900">{title}</h3>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (actionHref && !onAction) {
    return (
      <a href={actionHref} className="block">
        {content}
      </a>
    );
  }

  return content;
};
