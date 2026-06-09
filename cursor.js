/* Little-astronaut cursor 🧑‍🚀 — uses the transparent astronaut-cursor.png as the site cursor.
   Skips touch devices (no cursor there); falls back to the default cursor if the image fails. */
(function () {
  try {
    if (window.matchMedia && matchMedia('(pointer:coarse)').matches) return; // touch device
    var url = '/astronaut-cursor.png', hx = 7, hy = 6; // hotspot near the head/top-left
    var st = document.createElement('style');
    st.textContent =
      '*{cursor:url(' + url + ') ' + hx + ' ' + hy + ', auto}' +
      'input,textarea,select,[contenteditable="true"]{cursor:text}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* keep default cursor on any failure */ }
})();
