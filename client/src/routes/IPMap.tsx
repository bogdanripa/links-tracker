import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Custom icon for markers
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const locationsCache: { [key: string]: { ip: string; latitude: number; longitude: number; city: string; country: string } } = {};

interface IPMapProps {
  ipAddresses: string[];
}

const IPMap: React.FC<IPMapProps> = ({ ipAddresses }) => {
  const [locations, setLocations] = useState<{ ip: string; latitude: number; longitude: number; city: string; country: string }[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locationPromises = ipAddresses.map(async (ip) => {
        if (locationsCache[ip]) return locationsCache[ip];
        try {
          const response = await axios.get(`https://freeipapi.com/api/json/${ip}`);
          const { latitude, longitude, cityName: city, countryName: country } = response.data;
          locationsCache[ip] = { ip, latitude, longitude, city, country };
          return locationsCache[ip];
        } catch (error) {
          console.error(`Failed to fetch location for IP: ${ip}`, error);
          return null;
        }
      });

      const locationsData = await Promise.all(locationPromises);
      setLocations(locationsData.filter((loc) => loc !== null));
    };

    fetchLocations();
  }, [ipAddresses]);

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((location:any, index) => (
        <Marker
          key={index}
          position={[location.latitude, location.longitude]}
          icon={customIcon}
        >
          <Popup>
            <div>
              <p>IP: {location.ip}</p>
              <p>City: {location.city}</p>
              <p>Country: {location.country}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default IPMap;

// Usage example:
// <IPMap ipAddresses={["134.201.250.155", "72.229.28.185"]} />

// Notes:
// 1. No API key is required for ip-api.com for non-commercial use.
// 2. Ensure you have installed the required dependencies: `react-leaflet`, `leaflet`, and `axios`.
// 3. The component centers the map at [20, 0] with a zoom level of 2 to give a world map view.
