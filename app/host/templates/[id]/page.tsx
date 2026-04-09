import Link from "next/link"
import { notFound } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { deleteTemplate, updateTemplate } from "../actions"

const TOKENS = [
  "guest_name",
  "guest_email",
  "date",
  "time",
  "topic",
  "host_name",
  "show_name",
  "riverside_url",
  "scheduling_link",
]

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ test?: string }>
}

export default async function TemplateDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params
  const { test } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: template } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (!template) notFound()

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link
          href="/host/templates"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          &larr; Back
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">
          {template.name}
        </h1>
        {template.is_default && (
          <span className="rounded-full bg-[#f3f4f6] border border-[#d1d5db] px-2.5 py-0.5 text-xs font-medium text-[#374151]">
            default
          </span>
        )}
      </div>

      {test === "sent" && (
        <div className="mt-4 rounded-xl border border-[#86efac] bg-[#dcfce7] px-4 py-3 text-sm text-[#166534]">
          Test email sent to {user.email}
        </div>
      )}

      <form action={updateTemplate} className="mt-10 max-w-2xl space-y-6">
        <input type="hidden" name="id" value={template.id} />

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Edit Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={template.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject line</Label>
              <Input
                id="subject"
                name="subject"
                required
                defaultValue={template.subject}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                name="body"
                required
                rows={12}
                defaultValue={template.body}
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Available Tokens
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOKENS.map((token) => (
                  <code
                    key={token}
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]"
                  >
                    {`{{${token}}}`}
                  </code>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <Separator className="my-10" />

      <div className="max-w-2xl space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Danger Zone
        </p>
        <form action={deleteTemplate}>
          <input type="hidden" name="id" value={template.id} />
          <Button type="submit" variant="destructive">
            Delete template
          </Button>
        </form>
      </div>
    </div>
  )
}
