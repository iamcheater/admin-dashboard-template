import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { text } from "../i18n";
import { Sidebar } from "./Sidebar";
import { KEYBOARD_KEY } from "./constants";
import { NavContext } from "./nav-context";

export function AppLayout() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navControl = useMemo(() => ({ openNav: () => setIsNavOpen(true) }), []);

  useEffect(() => {
    if (!isNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEY.ESCAPE) setIsNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isNavOpen]);

  useEffect(() => {
    if (!isNavOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isNavOpen]);

  return (
    <div className="shell">
      <Sidebar isOpen={isNavOpen} onNavigate={() => setIsNavOpen(false)} />

      {isNavOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label={text.nav.close}
          onClick={() => setIsNavOpen(false)}
        />
      )}

      <div className="shell__main">
        <main className="shell__content">
          <NavContext value={navControl}>
            <Outlet />
          </NavContext>
        </main>
      </div>
    </div>
  );
}
