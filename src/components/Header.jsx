import { Globe } from 'lucide-react'

const Header = () => {
  return (
    <div className="w-full bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-zinc-100" />
            <h1 className="text-xl font-semibold text-zinc-100">
              Visa Requirements 🛂
            </h1>
          </div>
          <div className="text-sm text-zinc-400">
            for I-131 (Refugee Travel Document)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;