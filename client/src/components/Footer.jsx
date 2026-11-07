import { Cog, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 mt-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff6b2c] to-[#ffb020] p-[1px] flex items-center justify-center">
            <div className="w-full h-full bg-[var(--bg-main)] rounded-[7px] flex items-center justify-center">
              <Cog className="w-3.5 h-3.5 text-[#ff8c2b]" />
            </div>
          </div>
          <div>
            <span className="font-heading font-bold text-xs tracking-wider text-[var(--text-main)]">
              AME
            </span>
            <span className="text-[11px] text-[var(--text-subtle)] ml-2">
              Association of Mechanical Engineering
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
          <span>Built by</span>
          <a
            href="https://ayush110109mishra.github.io/Through-My-Frames/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--text-muted)] hover:text-[#ff8c2b] transition-colors underline decoration-dotted underline-offset-2"
          >
            Ayush Mishra
          </a>
        </div>
      </div>
    </footer>
  );
}
