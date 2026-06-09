/* Little-astronaut cursor 🧑‍🚀 — uses the transparent astronaut-cursor.png as the site cursor
   across the WHOLE page, links and buttons included (it's the brand cursor), while the text
   caret is kept on form fields. We force it with !important because component rules like
   .btn{cursor:pointer} and default link styling otherwise out-specify a plain `*` rule and
   leave you with the normal pointer hand on everything interactive.
   Skips touch devices (no cursor there); falls back to the default cursor if the image fails. */
(function () {
  try {
    if (window.matchMedia && matchMedia('(pointer:coarse)').matches) return; // touch device
    var url = '/astronaut-cursor.png', hx = 7, hy = 6; // hotspot near the head/top-left
    var cur = 'url(' + url + ') ' + hx + ' ' + hy + ', auto';
    var st = document.createElement('style');
    st.textContent =
      '*,a,button,[role="button"],.btn{cursor:' + cur + ' !important}' +
      'input,textarea,select,[contenteditable="true"]{cursor:text !important}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* keep default cursor on any failure */ }
})();
