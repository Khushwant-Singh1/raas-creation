import { redirect } from "next/navigation"

export default function AccountPage() {
  redirect("/account/orders")
  return null
}

