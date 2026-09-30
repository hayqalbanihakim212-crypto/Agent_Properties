import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Katalog from "./pages/Katalog";
import HubungiAgen from "./pages/HubungiAgen";
import DetailProperty from "./pages/DetailProperty";
import { getProperties } from "./services/api";
import "./App.css";

const parseDetailId = () => {
  const m = window.location.pathname.match(/^\/properti\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
};

export default function App() {
  const [tab, setTab] = useState("katalog");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true); // true sejak awal
  const [prefillProperty, setPrefillProperty] = useState(null);
  const [detailId, setDetailId] = useState(parseDetailId);

  // Muat data pertama kali
  useEffect(() => {
    let alive = true;
    getProperties()
      .then((data) => {
        if (alive) setProperties(data.data || []);
      })
      .catch((err) => console.error("Gagal memuat properti:", err.message))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Tombol "Perbarui"
  const refreshProperties = useCallback(() => {
    setLoading(true);
    getProperties()
      .then((data) => setProperties(data.data || []))
      .catch((err) => console.error("Gagal memuat properti:", err.message))
      .finally(() => setLoading(false));
  }, []);

  // Tombol back/forward browser
  useEffect(() => {
    const onPop = () => setDetailId(parseDetailId());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openDetail = (property) => {
    window.history.pushState({}, "", `/properti/${property.id}`);
    setDetailId(property.id);
    window.scrollTo({ top: 0 });
  };

  const closeDetail = () => {
    if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
    setDetailId(null);
  };

  const handleHubungi = (property) => {
    closeDetail();
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
            closeDetail();
            setTab(t);
          }}
        />

        {detailId ? (
          <DetailProperty
            key={detailId}
            id={detailId}
            onBack={() => {
              closeDetail();
              setTab("katalog");
            }}
            onHubungi={handleHubungi}
          />
        ) : (
          <>
            {tab === "katalog" && (
              <Katalog
                properties={properties}
                loading={loading}
                onRefresh={refreshProperties}
                onHubungi={handleHubungi}
                onDetail={openDetail}
              />
            )}
            {tab === "hubungi" && (
              <HubungiAgen
                properties={properties}
                prefillProperty={prefillProperty}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
