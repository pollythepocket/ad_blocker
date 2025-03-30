const observer = new MutationObserver(() => {
  const adElements = document.querySelectorAll('ytd-in-feed-ad-layout-renderer, .style-scope.ytd-in-feed-ad-layout-renderer ytd-statement-banner-renderer .style-scope.ytd-statement-banner-renderer tp-yt-paper-dialog-scrollable .tp-yt-paper-dialog-scrollable');
  
  if (adElements.length > 0) {
    console.log("Detected Ad Elements:", adElements);
    
    requestAnimationFrame(() => {
      adElements.forEach(element => {
        const parent = element.closest('ytd-rich-item-renderer');
        if (parent) {
          parent.remove();
        }
        element.remove();
      });
    });
  }
});

observer.observe(document.body, { childList: true, subtree: true, attributes: false });
