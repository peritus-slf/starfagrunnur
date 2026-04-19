import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="font-display text-xl font-semibold text-text-primary">
          Starfa<span className="text-text-tertiary">·</span>grunnur
        </a>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#stats" className="label transition-colors hover:text-amber">
            Gagnagrunnur
          </a>
          <a href="#search" className="label transition-colors hover:text-amber">
            Leita
          </a>
          <a href="#api" className="label transition-colors hover:text-amber">
            API
          </a>
          <a
            href="https://api.starfagrunnur.is/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="label transition-colors hover:text-amber"
          >
            Skjölun
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
