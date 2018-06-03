(() => {
  const namespace = 'ap-ext-modal';
  const modal = document.getElementById(namespace);
  const closeButton = modal.getElementsByClassName('close')[0];

  function close() {
    modal.style.display = 'none';
    modal.dispatchEvent(new Event(`${namespace}-close`));
  }

  closeButton.addEventListener('click', close);

  window.addEventListener('click', event => {
    if (event.target === modal) {
      close();
    }
  });
})();
