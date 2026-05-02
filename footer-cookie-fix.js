/* Move .footer-socials to be after .cookie-preferences-link when both exist.
   Uses MutationObserver fallback in case cookie link is injected later. */
(function(){
  function moveSocials(){
    var cookie = document.querySelector('.cookie-preferences-link');
    var socials = document.querySelector('.footer-socials');
    if(!cookie || !socials) return false;
    try{ cookie.parentNode.insertBefore(socials, cookie.nextSibling); }catch(e){ }
    return true;
  }
  document.addEventListener('DOMContentLoaded', function(){
    if(moveSocials()) return;
    var mo = new MutationObserver(function(){ if(moveSocials()) mo.disconnect(); });
    mo.observe(document.body, { childList: true, subtree: true });
    // safety fallback
    setTimeout(function(){ moveSocials(); mo.disconnect(); }, 2000);
  });
})();
