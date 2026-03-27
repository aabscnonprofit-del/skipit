"use client";

import { useEffect, useState } from "react";

type Report = {
  id: string;
  location_name: string;
  lat: number;
  lng: number;
  platform: string;
  issue_type: string;
  estimated_wait: number;
  note: string;
};

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 👉 получаем геолокацию
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.log("Location error:", err);
      }
    );
  }, []);

  // 👉 получаем данные
  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.log(err));
  }, []);

  // 👉 фильтр по радиусу 5 км
  const filteredReports = reports.filter((r) => {
    if (!userLocation) return false;

    const distance = getDistance(
      userLocation.lat,
      userLocation.lng,
      r.lat,
      r.lng
    );

    return distance <= 5;
  });

  if (!userLocation) {
    return (
      <div style={{ color: "white", padding: 20 }}>
        Getting your location...
      </div>
    );
  }

  return (
    <main style={{ padding: 20, color: "white" }}>
      <h1>ACTIVE SIGNALS</h1>

      <div style={{ marginTop: 20 }}>
        {filteredReports.length === 0 && <div>No signals nearby</div>}

        {filteredReports.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #333",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: "bold" }}>{r.location_name}</div>
            <div>{r.platform}</div>
            <div>{r.issue_type}</div>
            <div>{r.note}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
