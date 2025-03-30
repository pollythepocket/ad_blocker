    function hideAdElements() {
        const adElements = document.querySelectorAll("#player-ads, ytd-ad-slot-renderer");
        adElements.forEach(element => {
          element.style.display = "none";
        });
      }
  
      hideAdElements();