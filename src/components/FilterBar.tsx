const FilterBar = () => (
  <div className="bg-blue-100 rounded-lg px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
    <div className="flex gap-4 flex-wrap">
      <select className="bg-white px-4 py-2 rounded border text-sm">
        <option>All bills</option>
        <option>Introduced</option>
        <option>Became Law</option>
      </select>
      <select className="bg-white px-4 py-2 rounded border text-sm">
        <option>All states</option>
        <option>New York</option>
        <option>California</option>
      </select>
    </div>
    <span className="text-sm text-blue-700">98 bills found</span>
  </div>
);

export default FilterBar;
