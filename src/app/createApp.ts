import { appConfig } from '../config/app';
import { mapConfig } from '../config/map';
import { packRegistry } from '../content/packs';
import { createGameSession, submitGuess } from '../game/session';
import type { GameMode, GameSession } from '../game/types';
import { createMapView } from '../map/createMapView';

export function createApp(root: HTMLDivElement): void {
  const pack = packRegistry[appConfig.defaultPackId];

  if (!pack) {
    throw new Error(`Pack "${appConfig.defaultPackId}" is not registered.`);
  }

  let session = createGameSession(pack);
  const mapContainerId = 'map';
  let mapView: ReturnType<typeof createMapView> | null = null;

  function setMode(mode: GameMode): void {
    session = createGameSession(pack, { mode });
    render();
  }

  function nextRound(): void {
    session = createGameSession(pack, { mode: 'test' });
    render();
  }

  function render(): void {
    mapView?.destroy();
    mapView = null;

    const score = session.answers.filter((answer) => answer.isCorrect).length;
    const currentTarget = session.targetRegionId
      ? pack.regions.features.find((feature) => feature.properties.id === session.targetRegionId)
      : null;

    root.innerHTML = `
      <main class="layout">
        <section class="sidebar">
          <p class="eyebrow">${appConfig.eyebrow}</p>
          <h1>${appConfig.title}</h1>
          <p class="lead">${appConfig.description}</p>
          <div class="tabs">
            <button type="button" data-mode="learn" class="${session.mode === 'learn' ? 'active' : ''}">Learn</button>
            <button type="button" data-mode="test" class="${session.mode === 'test' ? 'active' : ''}">Test</button>
          </div>
          <section class="panel">
            ${
              session.mode === 'learn'
                ? `
                  <h2>${pack.meta.name}</h2>
                  <p>${pack.meta.summary}</p>
                  <ul class="region-list">
                    ${pack.regions.features
                      .map((feature) => `<li>${feature.properties.name}</li>`)
                      .join('')}
                  </ul>
                `
                : `
                  <h2>${currentTarget ? `Find: ${currentTarget.properties.name}` : 'Round complete'}</h2>
                  <p>${
                    currentTarget
                      ? currentTarget.properties.description
                      : `Final score: ${score} / ${session.answers.length}`
                  }</p>
                  <div class="stats">
                    <span>Answered: ${session.answers.length}</span>
                    <span>Correct: ${score}</span>
                  </div>
                  <button type="button" data-action="restart">Restart test</button>
                  <ol class="answer-list">
                    ${session.answers
                      .map(
                        (answer) => `
                          <li class="${answer.isCorrect ? 'ok' : 'bad'}">
                            ${answer.expectedName}: ${answer.isCorrect ? 'correct' : `wrong, clicked ${answer.guessedName}`}
                          </li>`
                      )
                      .join('')}
                  </ol>
                `
            }
          </section>
          <section class="panel info">
            <h2>Technical choices</h2>
            <ul>
              <li>Map rules live in <code>src/config</code>.</li>
              <li>Content packs live in <code>src/content/packs</code>.</li>
              <li>Game logic lives in <code>src/game</code>.</li>
              <li>Leaflet integration lives in <code>src/map</code>.</li>
            </ul>
          </section>
        </section>
        <section class="map-shell">
          <div id="${mapContainerId}" class="map"></div>
        </section>
      </main>
    `;

    root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode as GameMode;
        setMode(mode);
      });
    });

    root.querySelector<HTMLButtonElement>('[data-action="restart"]')?.addEventListener('click', nextRound);

    const mapElement = root.querySelector<HTMLDivElement>(`#${mapContainerId}`);
    if (!mapElement) {
      throw new Error('Map container was not rendered.');
    }

    mapView = createMapView(mapElement, mapConfig, (regionId) => {
      if (session.mode !== 'test') {
        return;
      }

      session = submitGuess(session, pack, regionId);
      render();
    });

    mapView.render({
      pack,
      session
    });
  }

  render();
}
