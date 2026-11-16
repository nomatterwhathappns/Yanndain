/** A lightweight chart marker; the Three.js ocean population is unchanged. */
export function mountRouteTraveler(root: HTMLElement) {
  const routes = [...root.querySelectorAll<SVGSVGElement>('.map-route')].map(svg => {
    const path = svg.querySelector<SVGPathElement>('.map-route-line')!;
    return {
      svg, path, length: path.getTotalLength(),
      mobile: svg.classList.contains('map-route-mobile'),
      scaleX: 1, scaleY: 1,
      traveler: svg.querySelector<SVGGElement>('.map-traveler')!,
      selection: svg.querySelector<SVGPathElement>('.map-route-selection')!,
    };
  });
  const stops = [...root.querySelectorAll<HTMLElement>('.map-stop')];
  const narrow = matchMedia('(max-width: 900px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let frame = 0;
  let previous = 0;
  let progress = .08;
  let selectedStop: number | null = null;
  let disposed = false;
  const motionReduced = () => reduced.matches || document.documentElement.classList.contains('reduced-motion');

  function stopProgress(stop: HTMLElement, mobile: boolean) {
    const raw = mobile ? stop.dataset.mobileProgress ?? stop.dataset.routeProgress : stop.dataset.routeProgress;
    const value = Number(raw);
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  }

  function highlightStop(index: number | null) {
    if (disposed) return;
    const stop = index === null ? undefined : stops[index];
    selectedStop = stop ? index : null;
    root.classList.toggle('has-active-stop', stop !== undefined);
    if (!stop) return;
    for (const route of routes) {
      // The dot and the illuminated route share the same exact path position.
      route.selection.style.strokeDasharray = `${stopProgress(stop, route.mobile) * 100} 100`;
    }
  }

  function draw() {
    const route = routes.find(route => route.mobile === narrow.matches) ?? routes[0]!;
    const distance = progress * route.length;
    const point = route.path.getPointAtLength(distance);
    const before = route.path.getPointAtLength(Math.max(0, distance - 1));
    const after = route.path.getPointAtLength(Math.min(route.length, distance + 1));
    const angle = Math.atan2((after.y - before.y) * route.scaleY, (after.x - before.x) * route.scaleX) * 180 / Math.PI;
    // Cancel nonuniform SVG scaling so the fish keeps its proportions on mobile.
    route.traveler.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) scale(${(1 / route.scaleX).toFixed(4)} ${(1 / route.scaleY).toFixed(4)}) rotate(${angle.toFixed(2)}) scale(.85)`);
    // Wrap around while invisible instead of crossing the chart to its start.
    route.traveler.style.opacity = String(Math.min(1, progress / .025, (1 - progress) / .025));
  }

  function tick(time: number) {
    if (disposed) return;
    const elapsed = previous ? Math.min((time - previous) / 1000, .05) : 0;
    previous = time;
    progress = (progress + elapsed / 60) % 1;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function update() {
    if (disposed) return;
    const stopped = !visible || document.hidden || motionReduced();
    root.classList.toggle('is-travel-paused', stopped);
    if (stopped) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    } else if (!frame) frame = requestAnimationFrame(tick);
  }

  function resize() {
    if (disposed) return;
    for (const route of routes) {
      const viewBox = route.svg.viewBox.baseVal;
      const bounds = route.svg.getBoundingClientRect();
      route.scaleX = bounds.width / viewBox.width || 1;
      route.scaleY = bounds.height / viewBox.height || 1;
      const xProperty = route.mobile ? '--mobile-x' : '--stop-x';
      const yProperty = route.mobile ? '--mobile-y' : '--stop-y';
      for (const stop of stops) {
        // Intrinsic path/viewBox coordinates also work for the hidden SVG variant.
        const point = route.path.getPointAtLength(stopProgress(stop, route.mobile) * route.length);
        const x = (point.x - viewBox.x) / viewBox.width;
        const y = (point.y - viewBox.y) / viewBox.height;
        stop.style.setProperty(xProperty, `${x * 100}%`);
        stop.style.setProperty(yProperty, `${y * 100}%`);
        if (route.mobile) {
          stop.classList.toggle('mobile-note-below', y < .12);
          stop.classList.toggle('mobile-stop-right', x > .5);
        } else stop.classList.toggle('note-below', y < .46);
      }
    }
    highlightStop(selectedStop);
    draw();
    update();
  }

  const controller = new AbortController();
  const { signal } = controller;
  narrow.addEventListener('change', resize, { signal });
  reduced.addEventListener('change', update, { signal });
  document.addEventListener('visibilitychange', update, { signal });
  const motionObserver = new MutationObserver(update);
  motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }, { threshold: 0 });
  observer.observe(root);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(root);
  resize();

  return {
    highlightStop,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      controller.abort();
      observer.disconnect();
      motionObserver.disconnect();
      sizeObserver.disconnect();
    },
  };
}
