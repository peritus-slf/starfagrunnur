import { PeritusLogo } from "./PeritusLogo";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <p className="mb-2 font-display text-lg font-semibold text-text-primary">
            Starfa<span className="text-text-tertiary">·</span>grunnur
          </p>
          <p className="text-sm font-light leading-relaxed text-text-tertiary">
            Opinn gagnagrunnur um íslenskt starfakerfi,
            hæfni og færni.
          </p>
        </div>

        {/* Data sources */}
        <div>
          <span className="label mb-4 block text-text-tertiary">
            Gagnalindir
          </span>
          <ul className="space-y-2 text-sm font-light text-text-secondary">
            <li>
              <span className="text-text-primary">ÍSTARF21</span> &mdash;
              Hagstofa Íslands
            </li>
            <li>
              <span className="text-text-primary">ESCO</span> &mdash;
              Evrópusambandið (CC BY 4.0)
            </li>
          </ul>
        </div>

        {/* Links */}
        <div>
          <span className="label mb-4 block text-text-tertiary">Tenglar</span>
          <ul className="space-y-2 text-sm font-light">
            <li>
              <a
                href="https://api.starfagrunnur.is/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-amber"
              >
                API skjölun
              </a>
            </li>
            <li>
              <a
                href="https://github.com/peritus-slf/starfagrunnur"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary transition-colors hover:text-amber"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:info@peritus.is"
                className="text-text-secondary transition-colors hover:text-amber"
              >
                info@peritus.is
              </a>
            </li>
          </ul>
        </div>
      </div>

      <hr className="divider mx-auto mt-12 max-w-6xl" />

      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="label-sm text-text-tertiary">
          &copy; {new Date().getFullYear()} Starfagrunnur. Opinn hugbúnaður.
        </p>
        <div className="flex items-center gap-3">
          <span className="label-sm text-text-tertiary">Umsjón</span>
          <PeritusLogo className="text-text-secondary" width={110} />
        </div>
      </div>
    </footer>
  );
}
