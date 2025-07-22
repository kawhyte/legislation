type StatCardProps = {
  label: string;
  value: number;
  note: string;
  color: 'blue' | 'indigo' | 'yellow' | 'red';
};

const bgColorMap = {
  blue: 'bg-blue-100 text-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
};

const StatCard = ({ label, value, note, color }: StatCardProps) => (
  <div className={`rounded-lg p-4 ${bgColorMap[color]} text-center`}>
    <div className="text-sm font-medium">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs mt-1">{note}</div>
  </div>
);

export default StatCard;
