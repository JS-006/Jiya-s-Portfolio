JIYA SENGHANI – SCROLL WEBSITE
==============================
Open index.html  (double-click works, no server needed).

TWO VERSIONS
  index.html    IMMERSIVE: pages are screens in a 3D tunnel; scrolling flies the camera through them
  classic.html  the earlier slide-up page-by-page scroll
  Both read the same list of pages in assets/pages.js


Scroll / swipe / arrow keys / PageUp-PageDown / Space  ->  next or previous page.

FILES
  index.html          the shell (tiny)
  assets/tunnel.js    IMMERSIVE scroll code (3D fly-through, dust, HUD)
  assets/tunnel.css   its look (dark space around the pages; pages keep their own cream)
  assets/pages.js     THE LIST OF PAGES - add your next page here
  posters/            preview images shown while flying past (optional; missing = title card)
  assets/scroll.js    CLASSIC scroll code – joins all pages, animations, input
  assets/scroll.css   look of the shell (progress line, counter, transitions)
  assets/bridge.js    1-line helper every page loads so scroll works over the page
  pages/home.html     your index  (nav + "View icons" button removed, animations switched on)
  pages/icons.html    your icons  (nav removed, animations play on arrival)
  pages/logo.html     your logo   (nav + Replay removed)
  pages/image.html    shows ONE full-page image: pages/image.html?img=img/xxx.jpg
  pages/img/          images used by pages

ADD YOUR 4th PAGE
  1. Save it as  pages/page4.html
  2. Put this just before </body> in that file:   <script src="../assets/bridge.js"></script>
  3. In assets/pages.js add one line to PAGES:   { src: 'pages/page4.html', title: 'Page 4' },
  Done. Counter, progress line and order update automatically.
  Tip: build the page for a 1440 x 810 (16:9) canvas – the shell scales it to fit any screen.

TWEAK THE FEEL  (top of assets/scroll.js -> SETTINGS)
  duration 1250  -> slower / faster move
  outgoingShift, outgoingScale, outgoingDim -> how the old page drifts, shrinks, darkens

ADD A FULL-PAGE IMAGE (no new html needed)
  save it in pages/img/ and add:  { src: 'pages/image.html?img=img/name.jpg', title: 'Name' },

ADD A VIDEO PAGE
  put the .mp4 in pages/video/ and add:  { src: 'pages/video.html?v=video/name.mp4&poster=video/poster.jpg', title: 'Video' },
  (plays muted + looping; click the video for sound)
