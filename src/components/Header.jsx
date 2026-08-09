import { useEffect, useRef, useState } from "react";

export function Header({ googleUser, onLogout, googleButtonRef }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <div className="header-signin-layout">
      <div className="page-header-top header-brand">
        <img
          src="/logo-option3.svg"
          alt="WeatherCompare logo"
          className="site-logo"
        />
        <div>
          <h1>Weather Compare App</h1>
          <p className="page-subheader">
            Vergleiche Wettervorhersagen verschiedener Orte auf einen Blick.
          </p>
        </div>
      </div>

      <section
        className="google-signin-panel"
        aria-label="Mein Konto"
        ref={panelRef}
      >
        <button
          type="button"
          className="account-trigger"
          aria-label="Mein Konto"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div className={`account-menu ${menuOpen ? "is-open" : ""}`}>
          <p className="account-menu-copy">
            Google sign in und geraeteuebergreifend auf locations zugreifen.
          </p>

          {!googleUser && (
            <div ref={googleButtonRef} className="google-signin-button" />
          )}

          {googleUser && (
            <div className="account-user-row">
              <p className="google-signin-status">
                Angemeldet als {googleUser.email}.
              </p>
              <button
                className="footer-link-btn"
                type="button"
                onClick={onLogout}
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
