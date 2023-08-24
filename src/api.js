import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '37696305-6a7afe6a6eccc7277829ccd16'

export const fetchPhotos = async (query, page, controllerRef) => {
  const response = await axios.get(`?key=${KEY}&q=${query}&page=${page}&image_type=photo&orientation=horizontal&per_page=12`, {signal: controllerRef.current.signal});
  return response.data;
}