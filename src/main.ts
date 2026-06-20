import 'leaflet/dist/leaflet.css';
import './styles/global.css';
import { createApp } from './app/createApp';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('App root "#app" was not found.');
}

createApp(root);
