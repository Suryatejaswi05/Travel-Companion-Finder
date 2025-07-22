import { Box, Typography, Card, CardMedia, CardContent, CardActions, Button, Chip, Rating } from '@mui/material';
import { faAward, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StyledEngineProvider } from '@mui/material/styles';
import './PlaceCard.css';

export default function PlaceCard({ place, selected, refProp }) {
  if (selected) refProp?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const awards = place?.awards?.map((award, idx) => (
      <Box display='flex' justifyContent='space-between' key={idx}>
        <FontAwesomeIcon className='award' icon={faAward} />
        <Typography variant='subtitle2' color='textSecondary'>{award.display_name}</Typography>
      </Box>
    )
  );

  return (
    <article>
      <StyledEngineProvider injectFirst>
        <Card className='place-card' elevation={4} id={place.location_id} sx={{borderRadius: 5}}>
          <CardMedia 
            component='img'
            height='180'
            image={place.photo ?
                place.photo.images.medium.url
                :
                'https://www.foodserviceandhospitality.com/wp-content/uploads/2016/09/Restaurant-Placeholder-001.jpg'
              }
            alt={place.photo?.caption}
          />
          <CardContent>
            <Box display='flex' flexDirection='column' justifyContent='space-between' alignItems='flex-start' >
              <Typography align='left' variant='h6'>{place.name}</Typography>
              {place.hotel_class && 
                <Typography variant='subtitle2'>{place.subcategory_type_label}</Typography>
              }
            </Box>
            <Box display='flex' justifyContent='space-between' alignItems='center' my={2}>
              <Rating readOnly value={parseFloat(place.rating)} />
              <Typography variant='subtitle2'>{place.num_reviews} review{place.num_reviews > 1 && 's'}</Typography>
            </Box>
            {place.price_level && 
              <Box display='flex' justifyContent='space-between' alignItems='center' >
                <Typography>Price</Typography>
                <Typography variant='subtitle2'>{place.price_level}</Typography>
              </Box>
            }
            <Box display='flex' justifyContent='space-between' alignItems='center' >
              <Typography>Ranking</Typography>
              <Typography variant='subtitle2' align='right'>{place.ranking}</Typography>
            </Box>
            {place.awards.length > 0 && 
              <Box sx={{ mt: 2 }} >
                {awards}
              </Box>
            }
            {place.cuisine?.length > 0 && 
              <Box display='flex' justify-content='flex-start' align-items='center' sx={{ flexWrap: 'wrap', my: 2 }}>
                {place.cuisine.map(({name}, idx) => {
                  return <Chip key={idx} size='small' label={name} sx={{ mb: 0.5, mr: 0.5 }}/>;
                })}
              </Box>
            }
            {place.address && 
              <Box display='flex' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
                <FontAwesomeIcon icon={faLocationDot} />
                <Typography variant='body2' align='right'>{place.address}</Typography>
              </Box>
            }
            {place.phone && 
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <FontAwesomeIcon icon={faPhone} />
                <Typography variant='body2'>{place.phone}</Typography>
              </Box>
            }
          </CardContent>
          {(place.web_url || place.website || place.business_listings?.mobile_contacts[0]?.value) &&
            <CardActions>
              {place.web_url && 
                <Button size='small' color='primary' onClick={() => window.open("", '_blank')}  disabled >&nbsp;</Button>
              }
              {place.website &&
                <Button size='small' color='primary' onClick={() => window.open(place.website, '_blank')} >Website</Button>
              }
              {place.business_listings?.mobile_contacts[0]?.value && 
                <Button size='small' color='primary' onClick={() => window.open(place.business_listings.mobile_contacts[0].value, '_blank')} >Trip Advisor</Button>
              }
            </CardActions>
          }
        </Card>
      </StyledEngineProvider>
    </article>
  );
}