import { ExternalLink } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 py-2 sm:py-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0">
          <h1 className="text-base sm:text-xl font-medium text-zinc-100">
          🇺🇸 Refugee Travel Document Visa Requirements
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="https://t.me/+In9zXZOpxbcwYWQ8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs sm:text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Join Telegram Group
              <span className="[&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-4 sm:[&>svg]:w-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 496 512">
                  <path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/>
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
