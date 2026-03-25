// app/page.tsx (Root page)
import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect root to login
  redirect("/login");
}