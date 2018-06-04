import { storage, similarDomains } from 'util/util';
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

// Modal
(async () => {
  const { sites } = await storage.get();
  const { location, document: { body, head } } = window;
  const { extension } = chrome;
  const targetSite = sites.find(site => similarDomains(site.domain, location.hostname));

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

// Icon
(async () => {
  const { extension } = chrome;
  const { sites } = await storage.get();
  const { location, URL } = window;

  if (
    !['google.com', 'google.ru', 'bing.com']
      .some(domain => similarDomains(domain, location.hostname))
  ) {
    return;
  }

  const { document, getComputedStyle } = window;
  const imgSrc = extension.getURL('dist/icons/main.png');

  Array.from(document.getElementsByTagName('cite'))
    .forEach(cite => {
      const { textContent, parentElement } = cite;
      let hostname;

      try {
        ({ hostname } = new URL(textContent));
      } catch (_) {
        //
      }

      // Sometimes search engines omit protocol but keep the slash at the end.
      if (!hostname) {
        try {
          ({ hostname } = new URL(`https://${textContent}`));
        } catch (_) {
          //
        }
      }

      if (!hostname) {
        return;
      }

      if (sites.find(({ domain }) => similarDomains(domain, hostname))) {
        const img = document.createElement('img');

        img.src = imgSrc;
        img.style.height = getComputedStyle(cite.parentElement).height;
        parentElement.insertBefore(img, cite);
      }
    });
})();
