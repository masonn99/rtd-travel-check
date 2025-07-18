const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 z-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
        <div className="flex items-center justify-center text-xs sm:text-sm text-zinc-400">
          <p>© {new Date().getFullYear()} RTD Travel Check. For informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
