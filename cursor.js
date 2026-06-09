/* Little-astronaut cursor 🧑‍🚀 — renders the astronaut emoji to a canvas and uses it as the
   site cursor. Skips touch devices, and bails safely (default cursor) if the emoji glyph
   doesn't render, so we never end up with an invisible cursor. */
(function () {
  try {
    if (window.matchMedia && matchMedia('(pointer:coarse)').matches) return; // touch device — no cursor
    var s = 34;
    var c = document.createElement('canvas');
    c.width = s; c.height = s;
    var g = c.getContext('2d');
    if (!g) return;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '26px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    g.fillText('🧑‍🚀', s / 2, s / 2 + 1); // 🧑‍🚀

    // Verify something actually painted (some systems lack the astronaut glyph)
    var data = g.getImageData(0, 0, s, s).data, painted = false;
    for (var i = 3; i < data.length; i += 4) { if (data[i] !== 0) { painted = true; break; } }
    if (!painted) return;

    var url = c.toDataURL('image/png');
    var st = document.createElement('style');
    st.textContent =
      '*{cursor:url(' + url + ') 7 4, auto}' +
      'input,textarea,select,[contenteditable="true"]{cursor:text}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { /* keep default cursor on any failure */ }
})();
