/* Apply the saved visual theme before the page paints. */
(function () {
  try {
    if (localStorage.getItem('sevaroute_theme') === 'light') {
      document.documentElement.classList.add('light-theme-active');
    }
  } catch (error) {
    // Private browsing or blocked storage should not prevent the page from loading.
  }
})();
