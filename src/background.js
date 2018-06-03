import { storage } from 'util/util';
import { MODAL_RETRY_COUNT, POPUP_PORT, SITE_LIST_URL, SITES_FETCH_INTERVAL } from 'util/constants';

// This port is needed for live updates to an already-open popup
let popupPort;

chrome.runtime.onConnect.addListener(port => {
  if (port.name === POPUP_PORT) {
    popupPort = port;

    port.onDisconnect.addListener(() => {
      popupPort = undefined;
    });
  }
});

async function fetchSites() {
  const { fetch } = window;
  let error = null;
  let sitesJson;

  try {
    const response = await fetch(SITE_LIST_URL);

    sitesJson = await response.json();
  } catch (err) {
    error = err.message;
  }

  const toStore = { fetchedAt: Date.now(), error };

  if (error) {
    toStore.sites = null;
  } else {
    toStore.sites = sitesJson.map(
      site => ({ showModal: MODAL_RETRY_COUNT, ...site }),
    );
  }

  // Note that we lose all counters and previous sites here,
  // not sure if we need to keep them.
  await storage.set(toStore);

  if (popupPort) {
    // Update popup if it's open.
    popupPort.postMessage(true);
  }
}

(async () => {
  let {
    fetchedAt,
    sites,
  } = await storage.get();

  fetchedAt = new Date(fetchedAt);

  // Handle first run
  if (Number.isNaN(fetchedAt.getTime())) {
    fetchedAt = new Date(0); // start of epoch
    await storage.set({ fetchedAt: fetchedAt.getTime() });
  }

  if (!Array.isArray(sites)) {
    sites = [];
    await storage.set({ sites });
  }

  // Reset modal counters
  // eslint-disable-next-line no-param-reassign
  sites.forEach(site => { site.showModal = MODAL_RETRY_COUNT; });
  await storage.set({ sites });

  const { setTimeout, setInterval } = window;
  const nextFetch = fetchedAt.getTime() + SITES_FETCH_INTERVAL;

  // Fetch immediately if we're late or wait for remaining interval and then fetch.
  // Schedule further fetch operations too.
  // All errors will be logged automagically but fetching should always be attempted again.
  setTimeout(() => {
    fetchSites().then(() => {
      setInterval(fetchSites, SITES_FETCH_INTERVAL);
    });
  }, nextFetch < Date.now() ? 0 : nextFetch - Date.now());
})();
