import { redirect } from "next/navigation"

export const metadata = {
  title: "Onchain World Cup | Qualification Phase",
  description: "Support your country. Vote to qualify for the Onchain World Cup tournament.",
}

export default function HomePage() {
  redirect("/qualification")
}
