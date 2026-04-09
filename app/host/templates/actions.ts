"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

function requiredText(value: FormDataEntryValue | null, label: string): string {
  const t = typeof value === "string" ? value.trim() : ""
  if (!t) throw new Error(`${label} is required`)
  return t
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (value == null || typeof value !== "string") return null
  const t = value.trim()
  return t.length ? t : null
}

export async function createTemplate(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = requiredText(formData.get("name"), "Name")
  const subject = requiredText(formData.get("subject"), "Subject")
  const body = requiredText(formData.get("body"), "Body")

  const { data, error } = await supabase
    .from("email_templates")
    .insert({ host_id: user.id, name, subject, body })
    .select("id")
    .single()

  if (error) throw new Error(error.message)

  revalidatePath("/host/templates")
  redirect(`/host/templates/${data.id}`)
}

export async function updateTemplate(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = requiredText(formData.get("id"), "Template ID")
  const name = requiredText(formData.get("name"), "Name")
  const subject = requiredText(formData.get("subject"), "Subject")
  const body = requiredText(formData.get("body"), "Body")

  const { error } = await supabase
    .from("email_templates")
    .update({ name, subject, body })
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/host/templates")
  revalidatePath(`/host/templates/${id}`)
  redirect(`/host/templates/${id}`)
}

export async function deleteTemplate(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = typeof formData.get("id") === "string" ? formData.get("id") : ""
  if (!id) redirect("/host/templates")

  await supabase
    .from("email_templates")
    .delete()
    .eq("id", id as string)
    .eq("host_id", user.id)

  revalidatePath("/host/templates")
  redirect("/host/templates")
}

export async function sendTestEmail(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const templateId = optionalText(formData.get("templateId"))
  const subject = requiredText(formData.get("subject"), "Subject")
  const body = requiredText(formData.get("body"), "Body")

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const res = await fetch(`${origin}/api/google/gmail/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "" },
    body: JSON.stringify({
      to: user.email,
      subject: `[TEST] ${subject}`,
      body,
      templateId,
      variables: {
        guest_name: "Test Guest",
        guest_email: "test@example.com",
        date: "Monday, January 1, 2026",
        time: "10:00 AM",
        topic: "Test Topic",
        host_name: user.user_metadata?.full_name ?? "Host",
        show_name: "My Podcast",
        riverside_url: "https://riverside.fm",
        scheduling_link: `${origin}/schedule/test`,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? "Failed to send test email")
  }

  revalidatePath(`/host/templates/${templateId}`)
  redirect(`/host/templates/${templateId}?test=sent`)
}
