import { redirect } from "next/navigation"

export default function ReferralsRedirect() {
  redirect("/my-bets?tab=referrals")
}
