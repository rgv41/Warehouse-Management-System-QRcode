// src/components/ModuleCard.js
import Link from 'next/link';

export default function ModuleCard({ title, description, href, borderColor }) {
  return (
    <Link href={href} className="block">
      <div className={`border-l-4 rounded-lg p-5 shadow-sm hover:shadow transition-shadow ${borderColor}`}>
        <h2 className="font-bold text-lg text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2 text-sm">{description}</p>
      </div>
    </Link>
  );
}