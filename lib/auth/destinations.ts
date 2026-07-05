import type { AuthChangeEvent } from "@supabase/supabase-js"

export const HOST_AUTH_DESTINATION = "/host/dashboard"
export const HOST_PASSWORD_RECOVERY_DESTINATION =
  "/auth/update-password?recovery=1"

export function isPasswordRecoveryType(type: string | null | undefined) {
  return type === "recovery"
}

export function authDestinationForType(type: string | null | undefined) {
  return isPasswordRecoveryType(type)
    ? HOST_PASSWORD_RECOVERY_DESTINATION
    : HOST_AUTH_DESTINATION
}

export function authDestinationForEvent(
  event: AuthChangeEvent,
  type: string | null | undefined
) {
  return event === "PASSWORD_RECOVERY"
    ? HOST_PASSWORD_RECOVERY_DESTINATION
    : authDestinationForType(type)
}
