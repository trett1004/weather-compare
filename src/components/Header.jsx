export function Header({ googleUser, onLogout, googleButtonRef }) {
  return (
    <div className="header-signin-layout">
      <div className="page-header-top header-brand">
        <img
          src="/logo-option3.svg"
          alt="WeatherCompare logo"
          className="site-logo"
        />
        <div>
          <h1>WeatherCompare</h1>
          <p className="page-subheader">
            Fuege mehrere Orte hinzu und vergleiche ihre Wettervorhersagen auf
            einen Blick - kein staendiges Wechseln mehr.
          </p>
        </div>
      </div>

      <section className="google-signin-panel" aria-label="Google Anmeldung">
        <div>
          <h2 className="google-signin-title">Google Sign-In</h2>
          {googleUser ? (
            <>
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
            </>
          ) : (
            <p className="google-signin-copy">
              Melde dich an, um deine Orte geraeteuebergreifend zu speichern.
            </p>
          )}
        </div>
        {!googleUser && (
          <div ref={googleButtonRef} className="google-signin-button" />
        )}
      </section>
    </div>
  );
}
