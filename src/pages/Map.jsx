import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { GeoJSON, useMap } from "react-leaflet";
import { listEvents, updateEvent } from "../dataconnect-generated";
import { getDataConnectClient } from "../firebase";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

import { useEventContext } from "./EventContext";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// --------------------
// FIX DEFAULT ICON
// --------------------
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const pinIcon = new L.Icon({
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// --------------------
// CONTROLS
// --------------------
function MapControls({ myOnly, setMyOnly }) {
    return (
        <div
            style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 1000,
                background: "white",
                padding: 10,
                borderRadius: 8,
            }}
        >
            <label style={{ display: "flex", gap: 6 }}>
                <input
                    type="checkbox"
                    checked={myOnly}
                    onChange={(e) => setMyOnly(e.target.checked)}
                />
                My Events Only
            </label>
        </div>
    );
}

// --------------------
// BUILDING LAYER (interactive)
// --------------------
// --------------------
// BUILDING LAYER (interactive)
// --------------------
function BuildingLayer({ data }) {
    const geoJsonRef = useRef(null);

    const baseStyle = {
        color: "#4a4a4a",
        weight: 1,
        fillColor: "#cfcfcf",
        fillOpacity: 0.2,
    };

    const hoverStyle = {
        color: "#1a73e8",
        weight: 2,
        fillColor: "#1a73e8",
        fillOpacity: 0.35,
    };

    return (
        <GeoJSON
            ref={geoJsonRef}
            data={data}
            style={baseStyle}
            onEachFeature={(feature, layer) => {
                layer.bindTooltip(feature.properties?.name || "Building", {
                    direction: "center",
                    className: "building-label",
                });

                layer.on({
                    mouseover: (e) => {
                        // Apply the hover style, but do NOT move the DOM element
                        e.target.setStyle(hoverStyle);
                    },
                    mouseout: (e) => {
                        // Natively revert the style
                        if (geoJsonRef.current) {
                            geoJsonRef.current.resetStyle(e.target);
                        }
                    },
                });
            }}
        />
    );
}

// --------------------
// CAMPUS FADE OVERLAY
// --------------------
function CampusFadeOverlay() {
    return (
        <GeoJSON
            data={{
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [-180, -90],
                            [180, -90],
                            [180, 90],
                            [-180, 90],
                            [-180, -90],
                        ],
                    ],
                },
            }}
            style={{
                fillColor: "#000",
                fillOpacity: 0.01,
                stroke: false,
            }}
            interactive={false}
        />
    );
}

// --------------------
// MAIN MAP
// --------------------
export default function MapView() {
    const { events, registeredEventIds } = useEventContext();

    const center = [34.722, -92.339];

    const [markers, setMarkers] = useState([]);
    const [myOnly, setMyOnly] = useState(false);
    const [buildingData, setBuildingData] = useState(null);

    const cache = useRef(new Map());

    // --------------------
    // GEOCODER
    // --------------------
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const geocode = async (location) => {
        if (!location) return null;

        if (cache.current.has(location)) {
            return cache.current.get(location);
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;

        try {
            await sleep(250);

            const res = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "campus-event-map" // helps reduce blocking
                }
            });

            if (!res.ok) return null;

            const data = await res.json();

            if (!data?.[0]) return null;

            const coords = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };

            cache.current.set(location, coords);
            return coords;
        } catch (err) {
            console.warn("Geocode failed:", location, err);
            return null;
        }
    };

    // --------------------
    // LOAD BUILDINGS
    // --------------------
    useEffect(() => {
        fetch("/campus-buildings.geojson")
            .then((r) => r.json())
            .then(setBuildingData)
            .catch(console.error);
    }, []);

    // --------------------
    // LOAD EVENTS
    // --------------------
    // --------------------
    // LOAD EVENTS
    // --------------------
    useEffect(() => {
        if (!events?.length) return;

        // Simply filter out events that don't have coordinates in the database
        const mapReadyEvents = events.filter(
            (event) => event.lat !== undefined && event.lng !== undefined && event.lat !== null && event.lng !== null
        );

        // Convert strings to numbers just in case your database stored them as text
        const formattedEvents = mapReadyEvents.map(event => ({
            ...event,
            lat: Number(event.lat),
            lng: Number(event.lng)
        }));

        setMarkers(formattedEvents);
    }, [events]);

    // --------------------
    // FILTER
    // --------------------
    const filtered = useMemo(() => {
        if (!myOnly) return markers;
        return markers.filter((m) => registeredEventIds.has(m.id));
    }, [markers, myOnly, registeredEventIds]);
  // =========================
  // ONE-TIME MIGRATION SCRIPT (V3 - FORCE OVERWRITE)
  // =========================
  const runGeocodeMigration = async () => {
    const confirmation = window.confirm("Ready to force overwrite ALL events with new coordinates?");
    if (!confirmation) return;

    console.log("Starting GeoJSON migration V3...");
    try {
      const res = await fetch("/campus-buildings.geojson");
      const geojson = await res.json();

      const client = getDataConnectClient();
      const response = await listEvents(client);
      const allEvents = response.data.eventLists; 
      let updatedCount = 0;

      // Extract all valid building names to help us debug misses
      const allBuildingNames = geojson.features
        .map(f => f.properties?.name)
        .filter(Boolean);

      for (const event of allEvents) {
        // 🚨 REMOVED THE SKIP CHECK! We are recalculating EVERYTHING. 🚨

        const searchStr = (event.location || "").toLowerCase().trim();
        if (!searchStr) continue;

        // Smarter fuzzy matching
        const matchedFeature = geojson.features.find((f) => {
          const buildingName = (f.properties?.name || "").toLowerCase().trim();
          
          if (!buildingName) return false; 
          if (buildingName === searchStr) return true;
          if (buildingName.includes(searchStr)) return true;
          if (buildingName.length > 2 && searchStr.includes(buildingName)) return true;

          return false;
        });

        let coords = { lat: 34.722, lng: -92.339 };

        if (matchedFeature) {
          let polyCoords = matchedFeature.geometry.coordinates;
          if (matchedFeature.geometry.type === "MultiPolygon") polyCoords = polyCoords[0];

          if (matchedFeature.geometry.type === "Polygon" || matchedFeature.geometry.type === "MultiPolygon") {
            const ring = polyCoords[0];
            let latSum = 0, lngSum = 0;
            ring.forEach(pt => {
              lngSum += pt[0];
              latSum += pt[1];
            });
            coords = { lat: latSum / ring.length, lng: lngSum / ring.length };
          } else if (matchedFeature.geometry.type === "Point") {
            coords = { lat: polyCoords[1], lng: polyCoords[0] };
          }
          console.log(`✅ Fixed: "${event.location}" matched to polygon: "${matchedFeature.properties.name}"`);
        } else {
          console.warn(`❌ Still couldn't match: "${event.location}".`);
          console.warn(`Here are all the available building names in your GeoJSON:`, allBuildingNames);
        }

        // FORCE the updated coordinates back to the database
        await updateEvent(client, {
          id: event.id,
          eventname: event.eventname,
          location: event.location,
          eventdesc: event.eventdesc,
          starttime: event.starttime,
          endtime: event.endtime,
          lat: coords.lat,
          lng: coords.lng,
        });

        updatedCount++;
      }

      alert(`Migration V3 complete! FORCED update on ${updatedCount} events. Refresh the page!`);
      
    } catch (err) {
      console.error("Migration failed:", err);
    }
  };

    return (
        <div style={{ height: "90vh", width: "100%", position: "relative" }}>
            <MapControls myOnly={myOnly} setMyOnly={setMyOnly} />
            <button
                onClick={runGeocodeMigration}
                style={{
                    position: "absolute",
                    top: 60,
                    right: 10,
                    zIndex: 1000,
                    padding: "10px 15px",
                    backgroundColor: "#d93025",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
            >
                ⚠️ Run Coordinate Migration
            </button>
            <MapContainer
                center={center}
                zoom={16}
                scrollWheelZoom
                preferCanvas={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* fade outside campus */}
                <CampusFadeOverlay />

                {/* buildings */}
                {buildingData && (
                    <BuildingLayer
                        data={buildingData}
                    />
                )}

                {/* markers */}
                <MarkerClusterGroup
                    chunkedLoading
                    spiderfyOnMaxZoom
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={false}
                    maxClusterRadius={60}
                >
                    {filtered.map((event) => (
                        <Marker
                            key={event.id}
                            position={[event.lat, event.lng]}
                            icon={pinIcon}
                        >
                            <Popup>
                                <div style={{ maxWidth: 220 }}>
                                    <h3>{event.eventname}</h3>
                                    <p>{event.location}</p>
                                    <p>
                                        {new Date(
                                            event.starttime
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}