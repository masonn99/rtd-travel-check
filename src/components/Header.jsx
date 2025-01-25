import { ExternalLink } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 py-2 sm:py-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0">
          <h1 className="text-base sm:text-xl font-medium text-zinc-100">
            Visa Requirements
          </h1>
          <a
            href="https://www.cbp.gov/sites/default/files/assets/documents/2019-Nov/New%20USCIS%20Travel%20Document%2020191105_0.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs sm:text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <span className="hidden sm:inline">for I-571 (Refugee Travel Document)</span>
            <span className="sm:hidden">I-571 Doc</span>
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
