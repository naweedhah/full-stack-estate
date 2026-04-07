import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import { Link } from "react-router-dom";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const listingMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Pin({ item }) {
  return (
    <Marker position={[item.latitude, item.longitude]} icon={listingMarkerIcon}>
      <Popup>
        <div className="popupContainer">
          <img src={item.images[0]} alt="" />
          <div className="textContainer">
            <Link to={`/${item.id}`}>{item.title}</Link>
            <span>{item.remainingSlots ?? item.capacity} slots</span>
            <b>LKR {item.rent}/month</b>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default Pin;
