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
    </div>
  );
};

export default Layout;
