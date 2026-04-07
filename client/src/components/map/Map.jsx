import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "./map.scss";
import "leaflet/dist/leaflet.css";
import Pin from "../pin/Pin";

const HEATMAP_COLORS = {
  high: "#E63946",
  medium: "#F4A261",
  low: "#2A9D8F",
};
const SRI_LANKA_CENTER = [7.8731, 80.7718];

const toCoordinate = (value) => {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

function Map({
  items,
  demandAreas = [],
  defaultCenter = SRI_LANKA_CENTER,
  defaultZoom = 8,
  focusSingleItem = false,
}) {
  const validItems = items
    .map((item) => ({
      ...item,
      latitude: toCoordinate(item.latitude),
      longitude: toCoordinate(item.longitude),
    }))
    .filter((item) => item.latitude !== null && item.longitude !== null);

  const validDemandAreas = demandAreas
    .map((area) => ({
      ...area,
      latitude: toCoordinate(area.latitude),
      longitude: toCoordinate(area.longitude),
    }))
    .filter((area) => area.latitude !== null && area.longitude !== null);

  const center =
    focusSingleItem && validItems.length === 1
      ? [validItems[0].latitude, validItems[0].longitude]
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={focusSingleItem && validItems.length === 1 ? 13 : defaultZoom}
      scrollWheelZoom={false}
      className="map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validItems.map((item) => (
        <Pin item={item} key={item.id} />
      ))}
      {validDemandAreas.map((area) => (
          <CircleMarker
            key={area.key}
            center={[area.latitude, area.longitude]}
            radius={Math.max(10, Math.min(28, 8 + area.demandScore))}
            pathOptions={{
              color: HEATMAP_COLORS[area.demandLevel] || HEATMAP_COLORS.low,
              fillColor: HEATMAP_COLORS[area.demandLevel] || HEATMAP_COLORS.low,
              fillOpacity: 0.22,
              weight: 2,
            }}
          >
            <Popup>
              <div className="demandPopup">
                <strong>{area.area}</strong>
                <span>{area.city}</span>
                <span>Demand: {area.demandLevel}</span>
                <span>Searches: {area.searches}</span>
                <span>Inquiries: {area.inquiries}</span>
                <span>Bookings: {area.bookings}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}

export default Map;
