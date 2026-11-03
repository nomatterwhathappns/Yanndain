/** A lightweight chart marker; the Three.js ocean population is unchanged. */
export function mountRouteTraveler(root: HTMLElement) {
  const routes = [...root.querySelectorAll<SVGSVGElement>('.map-route')].map(svg => {
    const path = svg.querySelector<SVGPathElement>('.map-route-line')!;
    const length = path.getTotalLength();
    return {
      svg, path, length, scaleX: 1, scaleY: 1,
      traveler: svg.querySelector<SVGGElement>('.map-traveler')!,
      selection: svg.querySelector<SVGPathElement>('.map-route-selection')!,
      destination: svg.querySelector<SVGCircleElement>('.map-route-destination')!,
      samples: Array.from({ length: 401 }, (_, i) => ({ point: path.getPointAtLength(length * i / 400), progress: i / 400 })),
    };
  });
  const stops = [...root.querySelectorAll<HTMLElement>('.map-stop')];
  const narrow = matchMedia('(max-width: 760px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let paused = false;
  let frame = 0;
  let previous = 0;
  let progress = .08;
  let destination: number | null = null;
  let selectedStop: number | null = null;
  let disposed = false;
  const motionReduced = () => reduced.matches || document.documentElement.classList.contains('reduced-motion');

  function nearest(route: typeof routes[number], x: number, y: number) {
    let best = route.samples[0];
    let distance = Infinity;
    for (const sample of route.samples) {
      const nextDistance = Math.hypot(sample.point.x * route.scaleX - x, sample.point.y * route.scaleY - y);
      if (nextDistance < distance) { best = sample; distance = nextDistance; }
    }
    return { ...best, distance };
  }
  function highlightStop(index: number | null) {
    selectedStop = index;
    root.classList.toggle('has-active-stop', index !== null);
    if (index === null) return;
    routes.forEach((route, i) => {
      const style = stops[index].style;
      const x = parseFloat(style.getPropertyValue(i ? '--mobile-x' : '--stop-x')) / 100 * route.svg.viewBox.baseVal.width * route.scaleX;
      const y = parseFloat(style.getPropertyValue(i ? '--mobile-y' : '--stop-y')) / 100 * route.svg.viewBox.baseVal.height * route.scaleY;
      route.selection.style.strokeDasharray = `${nearest(route, x, y).progress * 100} 100`;
    });
  }

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
    if (destination !== null) {
      const target = route.path.getPointAtLength(destination * route.length);
      route.destination.setAttribute('transform', `translate(${target.x} ${target.y}) scale(${1 / route.scaleX} ${1 / route.scaleY})`);
    }
  }
  function tick(time: number) {
    const elapsed = previous ? Math.min((time - previous) / 1000, .05) : 0;
    previous = time;
    const step = elapsed / (destination === null ? 60 : 5);
    if (destination !== null && (destination - progress + 1) % 1 <= step) {
      progress = destination;
      destination = null;
      root.classList.remove('is-route-guiding');
    } else progress = (progress + step) % 1;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function update() {
    if (disposed) return;
    const stopped = paused || !visible || document.hidden || motionReduced();
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
    highlightStop(selectedStop);
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
    highlightStop,
    guideTo(clientX: number, clientY: number) {
      const route = routes[narrow.matches ? 1 : 0];
      const bounds = route.svg.getBoundingClientRect();
      const target = nearest(route, clientX - bounds.left, clientY - bounds.top);
      if (target.distance > 32) return;
      destination = Math.max(.025, Math.min(.975, target.progress));
      if (motionReduced()) { progress = destination; destination = null; }
      root.classList.toggle('is-route-guiding', destination !== null);
      draw(); update();
    },
    setPaused(value: boolean) { paused = value; update(); },
    dispose() { disposed = true; cancelAnimationFrame(frame); controller.abort(); observer.disconnect(); motionObserver.disconnect(); sizeObserver.disconnect(); },
  };
}
