import { ReactNode, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const Layout = ({ children, hideFooter }: LayoutProps) => {
  useEffect(() => {
    // Fix stuck Radix UI Dialog/Sheet body scroll lock when navigating between routes
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, []);

  return (
    <div className="flex min-h-screen flex-col dark">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <div className="border-t border-primary/10 bg-background/80 py-2 text-center">
        <p className="text-[11px] text-muted-foreground/70 tracking-wide">
          By: <span className="text-primary/80">João Victor A.S Pascon</span>
        </p>
      </div>
    </div>
  );
};

export default Layout;
