import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { MarketingNav } from "@/components/marketing/marketing-nav"

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex flex-1 flex-col">{children}</main>
      <MarketingFooter />
    </div>
  )
}
