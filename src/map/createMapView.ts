import L, { type GeoJSON as LeafletGeoJsonLayer, type Map as LeafletMap, type PathOptions } from 'leaflet';
import type { GameSession, RegionFeature, RegionPack } from '../game/types';
import { mapConfig } from '../config/map';

type MapConfig = typeof mapConfig;

interface RenderInput {
  pack: RegionPack;
  session: GameSession;
}

export function createMapView(
  element: HTMLDivElement,
  config: MapConfig,
  onRegionSelected: (regionId: string) => void
): {
  render(input: RenderInput): void;
  destroy(): void;
} {
  const map: LeafletMap = L.map(element).setView(config.initialView.center, config.initialView.zoom);

  L.tileLayer(config.tileLayer.url, {
    attribution: config.tileLayer.attribution,
    maxZoom: config.tileLayer.maxZoom
  }).addTo(map);

  let layer: LeafletGeoJsonLayer | null = null;

  function styleForFeature(feature: RegionFeature, session: GameSession): PathOptions {
    if (session.mode === 'learn') {
      return config.learnStyle;
    }

    const latestAnswer = session.answers.at(-1);

    if (!latestAnswer) {
      return config.testStyle;
    }

    if (feature.properties.id === latestAnswer.expectedRegionId) {
      return latestAnswer.isCorrect ? config.correctStyle : config.expectedStyle;
    }

    if (!latestAnswer.isCorrect && feature.properties.id === latestAnswer.guessedRegionId) {
      return config.wrongGuessStyle;
    }

    return config.testStyle;
  }

  function bindFeature(feature: RegionFeature, targetLayer: L.Layer, session: GameSession): void {
    const regionId = feature.properties.id;
    const isLearnMode = session.mode === 'learn';

    if (targetLayer instanceof L.Path) {
      targetLayer.on('click', () => onRegionSelected(regionId));
    }

    if (isLearnMode) {
      targetLayer.bindTooltip(feature.properties.name, {
        permanent: true,
        direction: 'center',
        className: 'region-label'
      });
      targetLayer.bindPopup(`<strong>${feature.properties.name}</strong><br>${feature.properties.description}`);
    }
  }

  function render(input: RenderInput): void {
    layer?.remove();

    layer = L.geoJSON(input.pack.regions as never, {
      style: (feature) => styleForFeature(feature as unknown as RegionFeature, input.session),
      onEachFeature: (feature, targetLayer) => bindFeature(feature as RegionFeature, targetLayer, input.session)
    }).addTo(map);

    map.fitBounds(layer.getBounds(), { padding: [20, 20] });
  }

  function destroy(): void {
    layer?.remove();
    map.remove();
  }

  return { render, destroy };
}
