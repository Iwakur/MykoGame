import { appConfig } from '../config/app';
import { mapConfig } from '../config/map';
import { packRegistry } from '../content/packs';
import { createGameSession, submitGuess } from '../game/session';
import type { GameMode } from '../game/types';
import { createMapView } from '../map/createMapView';

type ThemeMode = 'light' | 'dark';

export function createApp(root: HTMLDivElement): void {
  const pack = packRegistry[appConfig.defaultPackId];

  if (!pack) {
    throw new Error(`Pack "${appConfig.defaultPackId}" is not registered.`);
  }

  let session = createGameSession(pack);
  const mapContainerId = 'map';
  let mapView: ReturnType<typeof createMapView> | null = null;
  let theme: ThemeMode = getInitialTheme();

  applyTheme(theme);

  function setMode(mode: GameMode): void {
    session = createGameSession(pack, { mode });
    render();
  }

  function nextRound(): void {
    session = createGameSession(pack, { mode: 'test' });
    render();
  }

  function toggleTheme(): void {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme(theme);
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
          <div class="sidebar-top">
            <div>
              <p class="eyebrow">${appConfig.eyebrow}</p>
              <h1>${appConfig.title}</h1>
            </div>
            <button type="button" class="theme-switch" data-action="theme-switch" aria-label="Змінити тему">
              ${theme === 'light' ? 'Темна тема' : 'Світла тема'}
            </button>
          </div>
          <p class="lead">${appConfig.description}</p>
          <div class="tabs">
            <button type="button" data-mode="learn" class="${session.mode === 'learn' ? 'active' : ''}">Вивчення</button>
            <button type="button" data-mode="test" class="${session.mode === 'test' ? 'active' : ''}">Тест</button>
          </div>
          <section class="panel">
            ${
              session.mode === 'learn'
                ? `
                  <h2>Режим вивчення</h2>
                  <p>На мапі видно всі місцевості з назвами. Натискай на область, щоб краще запам’ятати її та прив’язати назву до місця.</p>
                  <ul class="region-list">
                    ${pack.regions.features
                      .map((feature) => `<li>${feature.properties.name}</li>`)
                      .join('')}
                  </ul>
                `
                : `
                  <h2>${currentTarget ? `Знайди: ${currentTarget.properties.name}` : 'Раунд завершено'}</h2>
                  <p>${
                    currentTarget
                      ? currentTarget.properties.description
                      : `Результат: ${score} з ${session.answers.length}`
                  }</p>
                  <div class="stats">
                    <span>Відповідей: ${session.answers.length}</span>
                    <span>Правильно: ${score}</span>
                  </div>
                  <button type="button" data-action="restart">Почати знову</button>
                  <ol class="answer-list">
                    ${session.answers
                      .map(
                        (answer) => `
                          <li class="${answer.isCorrect ? 'ok' : 'bad'}">
                            ${answer.expectedName}: ${answer.isCorrect ? 'правильно' : `помилка, обрано ${answer.guessedName}`}
                          </li>`
                      )
                      .join('')}
                  </ol>
                `
            }
          </section>
          <section class="panel info">
            <h2>Як грати</h2>
            <p>У режимі вивчення дивись усі місцевості одразу. У режимі тесту прочитай опис і натисни на правильну область на мапі.</p>
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
    root.querySelector<HTMLButtonElement>('[data-action="theme-switch"]')?.addEventListener('click', toggleTheme);

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

function getInitialTheme(): ThemeMode {
  const savedTheme = window.localStorage.getItem('mykogame-theme');
  return savedTheme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem('mykogame-theme', theme);
}
