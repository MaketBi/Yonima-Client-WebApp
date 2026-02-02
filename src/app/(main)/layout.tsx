import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppInstallBanner } from "@/components/shared/app-install-banner";
import { DeepLinkRedirect } from "@/components/shared/deep-link-redirect";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <DeepLinkRedirect />
      </Suspense>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <AppInstallBanner />
    </div>
  );
}
