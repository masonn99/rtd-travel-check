const Footer = () => {
  return (
    <footer className="mt-auto bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-sm font-semibold text-zinc-300">RTD Travel Check</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Community-driven visa information for Refugee Travel Document holders.
            Always verify requirements with official sources before traveling.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <span>© {new Date().getFullYear()} RTD Travel Check</span>
            <span className="hidden sm:inline">•</span>
            <span>For informational purposes only</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
