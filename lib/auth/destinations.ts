export function authDestinationForType(type: string | null) {
  return type === "recovery" ? "/auth/update-password" : "/host/dashboard"
}
