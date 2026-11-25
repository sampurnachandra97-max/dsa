import './style.css';
export const metadata = { title: 'AlgoLab | DSA Practice', description: 'Build confidence with hands-on data structures and algorithms practice.', icons: { icon: '/algolab-mark.svg' } };
export default function Layout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
