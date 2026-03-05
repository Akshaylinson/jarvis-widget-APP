'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Tenants', path: '/tenants', icon: '👥' },
  { name: 'Assistants', path: '/assistants', icon: '🤖' },
  { name: 'Knowledge', path: '/knowledge', icon: '🧠' },
  { name: 'Conversations', path: '/conversations', icon: '💬' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'System', path: '/system', icon: '⚙️' },
  { name: 'Logs', path: '/logs', icon: '🚨' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">CodelessAI</h1>
        <p className="text-sm text-gray-400">Admin Dashboard</p>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-6 py-3 hover:bg-gray-800 transition ${
              pathname === item.path ? 'bg-gray-800 border-l-4 border-blue-500' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
