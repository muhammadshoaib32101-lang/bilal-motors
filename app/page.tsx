// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // This ensures that anyone hitting "/" is sent to the auth page
  redirect("/auth/login");
}
