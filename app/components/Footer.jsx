const Footer = () => {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-xs shadow-sm shadow-blue-600/30">
              ✈️
            </div>
            <span className="text-sm font-semibold text-zinc-300">RTD Travel Check</span>
          </div>
          <p className="text-xs text-zinc-600 text-center sm:text-left max-w-sm">
            Community-driven visa info for Refugee Travel Document holders. Always verify with official sources.
          </p>
          <span className="text-xs text-zinc-700">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
