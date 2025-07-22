import { useState, useEffect, createRef } from 'react';
import { Grid, Typography, InputLabel, MenuItem, FormControl, Select, CircularProgress } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import PlaceCard from '../../components/PlaceCard/PlaceCard';
import './List.css';

export default function List({ places, childClicked, isLoading, type, setType, rating, setRating, priceSort, setPriceSort }) {
  const [elRefs, setElRefs] = useState([]);

  useEffect(() => {
    const refs = Array(places.length).fill().map((_, idx) => elRefs[idx] || createRef());
    setElRefs(refs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);
  
  return (
    <StyledEngineProvider injectFirst>
      <section>
        <Typography variant='h5' className='heading'>Restaurants & Hotels  around you</Typography>
        {isLoading ? (
          <div>
            <CircularProgress size='5rem' sx={{ color: 'white' }} />
          </div>
        ) : (
          <>
            <div className='input-row'>
              <FormControl>
                <InputLabel sx={{ color: 'white' }} >Type</InputLabel>
                <Select variant='standard' value={type} onChange={(evt) => setType(evt.target.value)} className='select-bg'>
                  <MenuItem value='restaurants'>Restaurants</MenuItem>
                  <MenuItem value='hotels'>Hotels</MenuItem>
                  
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Rating</InputLabel>
                <Select variant='standard' value={rating} onChange={(evt) => setRating(evt.target.value)} className='select-bg' >
                  <MenuItem value={0}>All</MenuItem>
                  <MenuItem value={3}>3.0</MenuItem>
                  <MenuItem value={4}>4.0</MenuItem>
                  <MenuItem value={4.5}>4.5+</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Price</InputLabel>
                <Select variant='standard' value={priceSort} onChange={(evt) => setPriceSort(evt.target.value)} className='select-bg' >
                  <MenuItem value='low'>low to high</MenuItem>
                  <MenuItem value='high'>high to low</MenuItem>
                </Select>
              </FormControl>
            </div>
            <Grid container spacing={3} className='location-col'>
              {places?.map((place, idx) => {
                return ( 
                  <Grid item key={idx} xs={12} ref={elRefs[idx]}>
                    <PlaceCard place={place} selected={Number(childClicked) === idx} refProp={elRefs[idx]} />
                  </Grid>
                );
              })}
            </Grid>
          </>
        )
          }
      </section>
    </StyledEngineProvider>
  );
}