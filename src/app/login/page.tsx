import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSessionUser();
  if (session) redirect("/");

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="brand auth-brand"><span className="brand-mark">ij</span><span>innerj<span className="brand-dot">.</span></span></div>
        <h1>Welcome to InnerJ.</h1>
        <LoginForm />
      </section>
    </div>
  );
}
