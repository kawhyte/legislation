import { ModeToggle } from "./ModeToggle";

const Header = () => (
  <header className="bg-indigo-100 border-b border-gray-200 py-4 px-6 flex flex-wrap items-center justify-between">
    <h1 className="text-xl font-bold text-indigo-700">LEGISLATION TRACKER</h1>

    <div className="flex items-center gap-3 mt-3 sm:mt-0">
      <button className="bg-black text-white text-sm px-3 py-1 rounded">
        PFL
      </button>
      <button className="bg-white text-black text-sm px-3 py-1 rounded border">
        Unemployment
      </button>
      <button className="bg-white text-black text-sm px-3 py-1 rounded border">
        Withholdings
      </button>
      <input
        type="text"
        placeholder="Quick Search (State or Bill ID)"
        className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm"
      />
      <ModeToggle />
    </div>
  </header>
);

export default Header;