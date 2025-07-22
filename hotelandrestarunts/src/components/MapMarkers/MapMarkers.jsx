import { useState } from 'react';
import { Paper, Typography, Rating } from '@mui/material';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StyledEngineProvider } from '@mui/material';
import './MapMarkers.css';

export function MapMarkers({ place }) {
  const [showCard, setShowCard] = useState(false);

  function showLocationCard() {
    return (
      <Paper sx={{ ':hover': { boxShadow: 20 } }} className='map-card'>
        {place.photo && <img src={place.photo.images.small.url} alt={place.name} />}
        <Typography align='left' variant='subtitle2'>{place.name}</Typography>
        <Rating value={parseFloat(place.rating)} readOnly />
      </Paper>
    );
  }

  return (
    <StyledEngineProvider injectFirst>
      <FontAwesomeIcon 
        icon={faLocationDot} 
        color='red' 
        size='2x' 
        onMouseEnter={() => setShowCard(true)}
        onMouseLeave={() => setShowCard(false)}
        className='map-marker'
      />
      {showCard && showLocationCard()}
    </StyledEngineProvider>
  );
}