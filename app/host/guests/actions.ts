"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

function emptyToNull(value: FormDataEntryValue | null | undefined): string | null {
  if (value == null) return null
  const s = String(value).trim()
  return s.length > 0 ? s : null
}

export async function createGuest(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = formData.get("name")?.toString().trim() ?? ""
  const email = formData.get("email")?.toString().trim() ?? ""
  if (!name || !email) {
    redirect("/host/guests/new")
  }

  const { error } = await supabase.from("guests").insert({
    host_id: user.id,
    name,
    email,
    bio: emptyToNull(formData.get("bio")),
    notes: emptyToNull(formData.get("notes")),
  })

  if (error) {
    redirect("/host/guests/new")
  }

  revalidatePath("/host/guests")
  redirect("/host/guests")
}

export async function updateGuest(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = formData.get("id")?.toString().trim()
  if (!id) redirect("/host/guests")

  const name = formData.get("name")?.toString().trim() ?? ""
  const email = formData.get("email")?.toString().trim() ?? ""
  if (!name || !email) {
    redirect(`/host/guests/${id}`)
  }

  const { error } = await supabase
    .from("guests")
    .update({
      name,
      email,
      bio: emptyToNull(formData.get("bio")),
      notes: emptyToNull(formData.get("notes")),
    })
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) {
    redirect(`/host/guests/${id}`)
  }

  revalidatePath("/host/guests")
  revalidatePath(`/host/guests/${id}`)
  redirect(`/host/guests/${id}`)
}

export async function deleteGuest(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = formData.get("id")?.toString().trim()
  if (!id) redirect("/host/guests")

  await supabase.from("guests").delete().eq("id", id).eq("host_id", user.id)

  revalidatePath("/host/guests")
  redirect("/host/guests")
}
