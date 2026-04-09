import Link from "next/link"
import { redirect } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

export default async function TemplatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: templates } = await supabase
    .from("email_templates")
    .select("id, name, subject, is_default, updated_at")
    .eq("host_id", user.id)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold tracking-tight">Templates</h1>
        <Link
          href="/host/templates/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          New template
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Email templates for guest communications.
      </p>

      <div className="mt-10 space-y-3">
        {!templates || templates.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No templates yet.{" "}
              <Link
                href="/host/templates/new"
                className="underline underline-offset-4"
              >
                Create your first template
              </Link>
            </CardContent>
          </Card>
        ) : (
          templates.map((t) => (
            <Link key={t.id} href={`/host/templates/${t.id}`}>
              <Card className="rounded-xl transition-colors hover:border-[rgba(28,28,28,0.4)]">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.is_default && (
                        <span className="rounded-full bg-[#f3f4f6] border border-[#d1d5db] px-2 py-0.5 text-[10px] font-medium text-[#374151]">
                          default
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Subject: &ldquo;{t.subject}&rdquo;
                    </p>
                  </div>
                  <p className="font-mono text-[13px] text-muted-foreground">
                    {new Date(t.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
