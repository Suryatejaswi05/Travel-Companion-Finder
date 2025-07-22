import axios from 'axios';

export async function getPlacesData(type, sw, ne) {
  try {
    const { data: { data } } = await axios.get(`https://travel-advisor.p.rapidapi.com/${type}/list-in-boundary`, {
      params: {
        bl_latitude: sw.lat,
        tr_latitude: ne.lat,
        bl_longitude: sw.lng,
        tr_longitude: ne.lng
      }, 
      headers: {
        'x-rapidapi-key': '007ea046b0msh53b947b92a3c5f6p161e13jsne829bfa93cfa',
        'x-rapidapi-host': 'travel-advisor.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    });
    return data;
  } catch (error) {
    console.log(error);
  }
}