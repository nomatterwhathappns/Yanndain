import { discoverFeature } from '../content/interactions';

export interface ProjectPosition { scroll: number; open: string | null }
export function mountProjectPreviews(root: HTMLElement | null, position: ProjectPosition) {
  if (!root) return { save: () => position, dispose() {} };
  const controller = new AbortController();
  const { signal } = controller;
  const previews = [...root.querySelectorAll<HTMLDetailsElement>('.project-peek')];
  for (const preview of previews) preview.open = preview.dataset.project === position.open;
  root.scrollTop = position.scroll;
  root.addEventListener('toggle', event => {
    const preview = event.target as HTMLDetailsElement;
    if (!preview.matches('.project-peek') || !preview.open) return;
    for (const other of previews) if (other !== preview) other.open = false;
    discoverFeature('project-preview');
  }, { signal, capture: true });
  root.addEventListener('scroll', () => { if (root.scrollTop > 24) discoverFeature('project-scroll'); }, { signal, passive: true });
  return {
    save: () => ({ scroll: root.scrollTop, open: previews.find(item => item.open)?.dataset.project || null }),
    dispose: () => controller.abort(),
  };
}
