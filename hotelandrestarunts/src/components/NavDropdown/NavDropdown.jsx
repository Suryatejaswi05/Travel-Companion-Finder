import PlaceSearch from '../PlaceSearch/PlaceSearch';
import './NavDropdown.css';

export default function NavDropdown({ setCoordinates, onLoad, onPlaceChanged, isMobile }) {
  return (
    <nav>
      <div>
        <h1></h1>
      </div>
      <div>
        <PlaceSearch setCoordinates={setCoordinates} onLoad={onLoad} onPlaceChanged={onPlaceChanged} isMobile={isMobile} />
      </div>
    </nav>
  );
}