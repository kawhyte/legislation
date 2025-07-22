type BillCardProps = {
  id: string;
  introduced: string;
  status: string;
  summary: string;
  sources: string[];
};

const BillCard = ({ id, introduced, status, summary, sources }: BillCardProps) => (
  <div className="border rounded-xl p-4 shadow-sm bg-white space-y-3">
    <h3 className="text-blue-700 font-semibold text-sm">{id}</h3>
    <div className="flex justify-between text-xs text-gray-500">
      <span>Introduced: {introduced}</span>
      <span>Status: {status}</span>
    </div>
    <p className="text-sm text-gray-700">{summary}</p>
    <div className="text-xs text-gray-500 flex gap-2 items-center">
      Sources:
      {sources.map((src, idx) => (
        <span
          key={idx}
          className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium"
        >
          {src}
        </span>
      ))}
    </div>
  </div>
);

export default BillCard;
