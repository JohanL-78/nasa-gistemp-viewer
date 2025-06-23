import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <div className="logo">Nasa Gistemp Viewer</div>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="#visualization">Visualisation</Link></li>
        <li><Link href="#data">Données</Link></li>
        <li><Link href="#about">À propos</Link></li>
      </ul>
    </nav>
  );
}