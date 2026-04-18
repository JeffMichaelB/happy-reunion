interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
