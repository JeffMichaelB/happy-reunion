import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col px-6 py-12">
      <div className="pt-6">
        <Link
          href="/"
          className="inline-block transition-opacity hover:opacity-70"
          aria-label="The Reunion Projects home"
        >
          <span className="font-heading text-base font-bold tracking-tight text-foreground">
            The <span className="font-normal italic">Reunion</span> Projects
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-center py-12">
        {children}
      </div>
    </main>
  )
}
