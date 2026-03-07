"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type AuthGuardProps = {
  children: React.ReactNode;
  requireProfile?: boolean;
};

function isMissingProfileTableError(message?: string) {
  if (!message) return false;
  return (
    message.includes("public.user_profiles") ||
    message.includes("relation \"user_profiles\"")
  );
}

export function AuthGuard({ children, requireProfile = true }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session && pathname !== "/login") {
        router.replace("/login");
        return;
      }

      if (session && pathname === "/login") {
        router.replace("/dashboard");
        return;
      }

      if (session && requireProfile) {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profileError) {
          if (isMissingProfileTableError(profileError.message)) {
            setLoading(false);
            return;
          }
          setLoading(false);
          return;
        }

        if (!profile && pathname !== "/onboarding") {
          router.replace("/onboarding");
          return;
        }
      }

      setLoading(false);
    };

    check();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!currentSession && pathname !== "/login") router.replace("/login");
      if (currentSession && pathname === "/login") router.replace("/dashboard");
    });

    return () => subscription.subscription.unsubscribe();
  }, [pathname, requireProfile, router]);

  if (loading) {
    return (
      <div className="shell">
        <div className="container glass card" style={{ minHeight: 260, display: "grid", placeItems: "center" }}>
          Validando acesso...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
