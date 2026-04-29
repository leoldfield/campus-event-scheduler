import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { GeoJSON, useMap } from "react-leaflet";

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
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
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

        if (cache.current.has(location)) return cache.current.get(location);

        const proxy = (url) =>
            `https://corsproxy.io/?${encodeURIComponent(url)}`;

        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            location
        )}`;

        try {
            await sleep(250);

            const res = await fetch(proxy(url));
            const data = await res.json();

            if (!data?.[0]) return null;

            const coords = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };

            cache.current.set(location, coords);
            return coords;
        } catch {
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
    useEffect(() => {
        const run = async () => {
            const results = [];

            for (const event of events) {
                if (event.lat && event.lng) {
                    results.push({
                        ...event,
                        lat: Number(event.lat),
                        lng: Number(event.lng),
                    });
                    continue;
                }

                const coords = await geocode(event.location);
                if (!coords) continue;

                results.push({ ...event, ...coords });
            }

            setMarkers(results);
        };

        if (events?.length) run();
    }, [events]);

    // --------------------
    // FILTER
    // --------------------
    const filtered = useMemo(() => {
        if (!myOnly) return markers;
        return markers.filter((m) => registeredEventIds.has(m.id));
    }, [markers, myOnly, registeredEventIds]);

    return (
        <div style={{ height: "90vh", width: "100%", position: "relative" }}>
            <MapControls myOnly={myOnly} setMyOnly={setMyOnly} />

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