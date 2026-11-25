const icons = {
  logo: 'M5 8l-4 4 4 4m14-8 4 4-4 4M14 4l-4 16',
  grid: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1',
  bookmark: 'M6 4h12v16l-6-4-6 4z',
  chart: 'M4 19h16M7 16v-5m5 5V5m5 11V8',
  target: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-5 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5 0h.01',
  check: 'm5 12 4 4L19 6',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 5 5 5',
  chevron: 'm9 5 7 7-7 7',
  bolt: 'm13 2-9 12h7l-1 8 10-12h-7z',
  reset: 'M3 12a9 9 0 1 1 3 7M3 6v6h6',
  play: 'm8 5 12 7-12 7z',
  book: 'M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z',
};
export default function Icon({ name, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name]} /></svg>;
}
