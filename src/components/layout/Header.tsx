export default function Header() {
  return (
    <header className="topbar">
      <a className="brand" href="/">
        <span className="brand-mark">C</span>
        <span>cwad-repo-to-pdf</span>
      </a>

      <a
        className="github-link"
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
      >
        GitHub ↗
      </a>
    </header>
  );
}