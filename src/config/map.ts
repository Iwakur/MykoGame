export const mapConfig = {
  initialView: {
    center: [46.975, 31.995] as [number, number],
    zoom: 11
  },
  tileLayer: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  },
  learnStyle: {
    color: '#175cd3',
    weight: 2,
    fillColor: '#84adff',
    fillOpacity: 0.45
  },
  testStyle: {
    color: '#1f2937',
    weight: 2,
    fillColor: '#9ca3af',
    fillOpacity: 0.28
  },
  correctStyle: {
    color: '#15803d',
    weight: 3,
    fillColor: '#4ade80',
    fillOpacity: 0.5
  },
  expectedStyle: {
    color: '#b54708',
    weight: 3,
    fillColor: '#fdb022',
    fillOpacity: 0.55
  },
  wrongGuessStyle: {
    color: '#b42318',
    weight: 3,
    fillColor: '#fda29b',
    fillOpacity: 0.5
  }
} as const;
