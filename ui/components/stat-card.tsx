import clsx from "clsx";

export default function StatCard({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string | number;
  tone?: "default" | "danger" | "accent";
}) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div
        className={clsx(
          "mt-2 text-2xl font-semibold",
          tone === "danger" && "text-[var(--danger)]",
          tone === "accent" && "text-[var(--accent)]"
        )}
      >
        {value}
      </div>
    </div>
  );
}
