import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import Katalog from "./pages/Katalog";
import HubungiAgen from "./pages/HubungiAgen";
import { getProperties } from "./services/api";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("katalog");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prefillProperty, setPrefillProperty] = useState(null);
  const isMounted = useRef(true);

  const fetchProperties = useCallback(() => {
    setLoading(true);
    getProperties()
      .then((data) => {
        if (isMounted.current) setProperties(data.data || []);
      })
      .catch((err) => console.error("Gagal memuat properti:", err.message))
      .finally(() => {
        if (isMounted.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchProperties();
    return () => { isMounted.current = false; };
  }, [fetchProperties]);

  // Klien klik "Hubungi Agen" dari card properti
  const handleHubungi = (property) => {
    setPrefillProperty(property);
    setTab("hubungi");
  };

  return (
    <div className="app-wrapper">
      <div className="container">
        <Header
          tab={tab}
          setTab={(t) => {
            if (t !== "hubungi") setPrefillProperty(null);
            setTab(t);
          }}
        />

        {tab === "katalog" && (
          <Katalog
            properties={properties}
            loading={loading}
            onRefresh={fetchProperties}
            onHubungi={handleHubungi}
          />
        )}
        {tab === "hubungi" && (
          <HubungiAgen
            properties={properties}
            prefillProperty={prefillProperty}
          />
        )}
      </div>
    </div>
  );
}
