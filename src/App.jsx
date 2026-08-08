import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_WEATHER_MODEL,
  MAX_LOCATIONS,
  MOCK_WEATHER_LOCATION,
} from "./constants";
import { LocationList } from "./components/LocationList";
import { SearchSection } from "./components/SearchSection";
import { getSavedLocations, saveLocations } from "./services/locationStorage";

// const GOOGLE_CLIENT_ID =
//   "383266857837-ge2fjnlou2c87khgsi41lf468b2m21lu.apps.googleusercontent.com";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new Error("Missing VITE_GOOGLE_CLIENT_ID");
}

export default function App() {
  const [locations, setLocations] = useState(() => getSavedLocations());
  const [hint, setHint] = useState("");
  const [weatherModel, setWeatherModel] = useState(DEFAULT_WEATHER_MODEL);
  const [googleUser, setGoogleUser] = useState(null);
  const [windUnit, setWindUnit] = useState(
    () => localStorage.getItem("windUnit") || "ms",
  );
  const googleButtonRef = useRef(null);
  // Prevents saving localStorage locations to DB before the DB locations are loaded
  const dbLoadedRef = useRef(false);

  function handleWindUnitToggle() {
    const next = windUnit === "ms" ? "kn" : "ms";
    setWindUnit(next);
    localStorage.setItem("windUnit", next);
  }

  // On mount: restore session and load DB locations if the user is already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const meRes = await fetch("/api/me");
        if (!meRes.ok) return;
        const user = await meRes.json();
        setGoogleUser(user);
        try {
          const locRes = await fetch("/api/locations");
          if (locRes.ok) {
            const dbLocations = await locRes.json();
            if (Array.isArray(dbLocations)) setLocations(dbLocations);
          }
        } finally {
          dbLoadedRef.current = true;
        }
      } catch {
        // No active session, stay logged out
      }
    }
    checkSession();
  }, []);

  // Save locations: to DB when logged in, to localStorage when not
  useEffect(() => {
    if (googleUser) {
      if (!dbLoadedRef.current) return;
      const toSave = locations.filter((l) => !l.isMock);
      fetch("/api/locations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: toSave }),
      }).catch(() => {});
    } else {
      saveLocations(locations);
    }
  }, [locations, googleUser]);

  useEffect(() => {
    if (!hint) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setHint("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hint]);

  useEffect(() => {
    function initializeGoogleSignIn() {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const authRes = await fetch("/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential }),
            });
            if (!authRes.ok) return;
            const user = await authRes.json();
            setGoogleUser(user);
            try {
              const locRes = await fetch("/api/locations");
              if (locRes.ok) {
                const dbLocations = await locRes.json();
                if (Array.isArray(dbLocations)) setLocations(dbLocations);
              }
            } finally {
              dbLoadedRef.current = true;
            }
          } catch {
            // Network error during login
          }
        },
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "signin_with",
      });
    }

    initializeGoogleSignIn();

    const scriptElement = document.getElementById("google-identity-script");
    if (!scriptElement) {
      return undefined;
    }

    scriptElement.addEventListener("load", initializeGoogleSignIn);

    return () => {
      scriptElement.removeEventListener("load", initializeGoogleSignIn);
    };
  }, []);

  function handleLogout() {
    fetch("/auth/logout", { method: "POST" })
      .then(() => {
        dbLoadedRef.current = false;
        setGoogleUser(null);
        setLocations(getSavedLocations());
      })
      .catch(() => {});
  }

  function handleAddLocation(location) {
    if (locations.length >= MAX_LOCATIONS) {
      setHint(
        `Maximal ${MAX_LOCATIONS} Orte erlaubt. Bitte zuerst einen entfernen.`,
      );
      return;
    }

    if (locations.some((savedLocation) => savedLocation.id === location.id)) {
      setHint("Dieser Ort ist bereits gespeichert.");
      return;
    }

    setLocations((currentLocations) => [location, ...currentLocations]);
  }

  function handleRemoveLocation(locationId) {
    setLocations((currentLocations) =>
      currentLocations.filter((location) => location.id !== locationId),
    );
  }

  function handleReorderLocations(newLocations) {
    setLocations(newLocations);
  }

  return (
    <>
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
                onClick={handleLogout}
              >
                Abmelden
              </button>
            </>
          ) : (
            <p className="google-signin-copy">
              Melde dich an, um deine Orte geräteübergreifend zu speichern.
            </p>
          )}
        </div>
        {!googleUser && (
          <div ref={googleButtonRef} className="google-signin-button" />
        )}
      </section>
      <SearchSection
        onAddLocation={handleAddLocation}
        hint={hint}
        weatherModel={weatherModel}
        onModelChange={setWeatherModel}
      />
      <LocationList
        locations={locations}
        onRemoveLocation={handleRemoveLocation}
        onReorderLocations={handleReorderLocations}
        weatherModel={weatherModel}
        windUnit={windUnit}
        onWindUnitToggle={handleWindUnitToggle}
      />
      <footer className="site-footer">
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
        <button
          className="footer-link-btn"
          type="button"
          onClick={() => handleAddLocation(MOCK_WEATHER_LOCATION)}
        >
          Explanation icons and colors
        </button>
      </footer>
    </>
  );
}
