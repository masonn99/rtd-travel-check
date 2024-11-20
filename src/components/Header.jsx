import { ExternalLink } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-zinc-900 border-b border-zinc-800 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-zinc-100">
            Visa Requirements
          </h1>
          <a
            href="https://www.cbp.gov/sites/default/files/assets/documents/2019-Nov/New%20USCIS%20Travel%20Document%2020191105_0.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            for I-571 (Refugee Travel Document)
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;