import axios from 'axios'

export const instance = axios.create({
  baseURL:import.meta.env.BASE_URI | 'https://localhost:6000/api',
  timeout: 1000,
  withCredentials:true
});
