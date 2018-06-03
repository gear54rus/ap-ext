import { storage } from 'util/util';
import modalTmpl from './modal.handlebars';

// Assumes 'site.name' is unique.
async function updateSite(targetSite, newShowModal) {
  const { sites } = await storage.get();

  if (sites.some(site => {
    if (site.name === targetSite.name) {
      // eslint-disable-next-line no-param-reassign
      site.showModal = newShowModal;

      return true;
    }

    return false;
  })) {
    await storage.set({ sites });
  }
}

(async () => {
  const { sites } = await storage.get();
  const { location, document: { body, head } } = window;
  const { extension } = chrome;

  const targetSite = sites.find(site => [site.domain, `www.${site.domain}`].includes(location.hostname));

  if (targetSite && (targetSite.showModal > 0)) {
    body.innerHTML += modalTmpl({
      message: targetSite.message,
      imgSrc: extension.getURL('dist/icons/main.png'),
    });

    const namespace = 'ap-ext-modal';
    const script = document.createElement('script');
    const style = document.createElement('link');

    script.src = extension.getURL('dist/content/modal.js');
    style.rel = 'stylesheet';
    style.href = extension.getURL('dist/content/modal.css');

    head.appendChild(script);
    head.appendChild(style);
    updateSite(targetSite, targetSite.showModal - 1);

    document.getElementById(namespace)
      .addEventListener(`${namespace}-close`, () => {
        updateSite(targetSite, 0);
      });
  }
})();
