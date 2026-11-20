const Footer = () => {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">RTD Travel Check</p>
        <p className="text-[13px] text-ink-3 max-w-md">
          Community-driven information for US Refugee Travel Document holders. Always verify with the embassy or your airline before you travel.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
