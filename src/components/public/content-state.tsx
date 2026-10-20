import Link from "next/link";

export function ContentState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="content-state" role="status">
      <span className="content-state__mark" aria-hidden="true">✳</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <Link className="text-link" href={action.href}>{action.label} <span aria-hidden="true">↗</span></Link>}
    </div>
  );
}

export function LoadingState({ label = "Loading content…" }: { label?: string }) {
  return (
    <div className="content-state content-state--loading" role="status">
      <span className="loading-mark" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
