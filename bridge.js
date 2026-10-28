/* bridge.js — put this ONE line at the end of every page file:
 *   <script src="../assets/bridge.js"></script>
 * It forwards wheel / swipe / key presses from inside the page to the scroll shell,
 * so scrolling works even when the mouse is over the page. Nothing else is touched. */
(function () {
  if (window.parent === window) return;
  var send = function (m) { try { parent.postMessage(Object.assign({ __nav: 1 }, m), '*'); } catch (e) {} };
  addEventListener('wheel', function (e) { e.preventDefault(); send({ t: 'wheel', dy: e.deltaY, dx: e.deltaX }); }, { passive: false });
  var y0 = null;
  addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
  addEventListener('touchend', function (e) {
    if (y0 == null) return;
    send({ t: 'swipe', dy: y0 - e.changedTouches[0].clientY }); y0 = null;
  }, { passive: true });
  addEventListener('keydown', function (e) { send({ t: 'key', key: e.key, shift: e.shiftKey }); });
})();
