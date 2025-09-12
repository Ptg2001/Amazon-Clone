import api from './api';

const contentAPI = {
  getHeroSlides: () => api.get('/content/hero'),
  updateHeroSlides: (slides: any[]) => api.put('/content/hero', { slides }),
};

export default contentAPI;


