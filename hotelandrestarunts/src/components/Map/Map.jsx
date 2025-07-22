import GoogleMapReact from 'google-map-react';
import { MapMarkers } from '../MapMarkers/MapMarkers';
import { StyledEngineProvider } from '@mui/material';
import './Map.css';

export default function Map({ coordinates, setCoordinates, setBounds, places, setChildClicked, isMobile }) {
  const markers = places?.map((place, idx) => {
    return <MapMarkers key={idx} lat={Number(place.latitude)} lng={Number(place.longitude)} place={place} />;
  });

  const mapStyles = isMobile ? 
    { 
      position: 'absolute', 
      height: '100vh', 
      width: '100vw', 
      left: 0, 
      top: 0
    } 
    : 
    { height: '89vh', width: '100%' };

  return (
    <StyledEngineProvider injectFirst>
      <div className='map' style={mapStyles}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
          defaultCenter={{ lat: 0, lng: 0 }}
          center={coordinates}
          defaultZoom={14}
          options={{ disableDefaultUI: true, zoomControl: true }}
          onChange={(evt) => {
            setCoordinates({ lat: evt.center.lat, lng: evt.center.lng });
            setBounds({ ne: evt.marginBounds.ne, sw: evt.marginBounds.sw });
          }}
          onChildClick={(child) => setChildClicked(child)}
        >
          {markers}
        </GoogleMapReact>
      </div>
    </StyledEngineProvider>
  );
}