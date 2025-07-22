import { Autocomplete } from '@react-google-maps/api';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InputBase, Typography } from '@mui/material';
import './PlaceSearch.css';

export default function PlaceSearch({ onPlaceChanged, onLoad, isMobile }) {
  return (
    <div className='search-row'>
      {!isMobile && <Typography variant='subtitle2' className='res-fs'>Explore new places</Typography>}
      <div className='search-input'>
        <FontAwesomeIcon className='icon' icon={faMagnifyingGlass} />
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} >
          <InputBase placeholder='Search...' />
        </Autocomplete>
      </div>
    </div>
  );
}