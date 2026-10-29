/** A lightweight chart marker; the Three.js ocean population is unchanged. */
export function mountRouteTraveler(root: HTMLElement) {
  const routes = [...root.querySelectorAll<SVGSVGElement>('.map-route')].map(svg => {
    const path = svg.querySelector<SVGPathElement>('.map-route-line')!;
    return { svg, path, traveler: svg.querySelector<SVGGElement>('.map-traveler')!, length: path.getTotalLength(), scaleX: 1, scaleY: 1 };
  });
  const narrow = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let paused = false;
  let frame = 0;
  let previous = 0;
  let progress = .08;
  let disposed = false;

  function draw() {
    const route = routes[narrow.matches ? 1 : 0];
    const distance = progress * route.length;
    const point = route.path.getPointAtLength(distance);
    const next = route.path.getPointAtLength(Math.min(distance + 2, route.length));
    const angle = Math.atan2((next.y - point.y) * route.scaleY, (next.x - point.x) * route.scaleX) * 180 / Math.PI;
    // Keep the fish's proportions even when the mobile chart is tall and narrow.
    route.traveler.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) scale(${(1 / route.scaleX).toFixed(4)} ${(1 / route.scaleY).toFixed(4)}) rotate(${angle.toFixed(2)}) scale(.85)`);
    // Reappear at the start while invisible, rather than darting across the chart.
    route.traveler.style.opacity = String(Math.min(1, progress / .025, (1 - progress) / .025));
  }
  function tick(time: number) {
    const elapsed = previous ? Math.min((time - previous) / 1000, .05) : 0;
    previous = time;
    progress = (progress + elapsed / 60) % 1;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function update() {
    if (disposed) return;
    const stopped = paused || !visible || document.hidden || reduced.matches || document.documentElement.classList.contains('reduced-motion');
    root.classList.toggle('is-travel-paused', stopped);
    if (stopped) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    else if (!frame) frame = requestAnimationFrame(tick);
  }
  const resize = () => {
    for (const route of routes) {
      const bounds = route.svg.getBoundingClientRect();
      route.scaleX = bounds.width / route.svg.viewBox.baseVal.width || 1;
      route.scaleY = bounds.height / route.svg.viewBox.baseVal.height || 1;
    }
    draw(); update();
  };
  const controller = new AbortController();
  const { signal } = controller;
  narrow.addEventListener('change', resize, { signal });
  reduced.addEventListener('change', update, { signal });
  document.addEventListener('visibilitychange', update, { signal });
  const motionObserver = new MutationObserver(update);
  motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }, { threshold: 0 });
  observer.observe(root);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(root);
  resize();
  return {
    setPaused(value: boolean) { paused = value; update(); },
    dispose() { disposed = true; cancelAnimationFrame(frame); controller.abort(); observer.disconnect(); motionObserver.disconnect(); sizeObserver.disconnect(); },
  };
}
