const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-sm text-center text-zinc-400">
          Disclaimer: This is community-sourced data from the{" "}
          <a
            href="https://t.me/+hgENDIRxoTs0NGQx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            I-131 Telegram Group
          </a>
          . Always confirm visa requirements with official sources before planning your travel!
        </p>
      </div>
    </footer>
  );
};

export default Footer;