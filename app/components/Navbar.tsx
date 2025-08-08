'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/form', label: 'Research Form' },
  ]

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="text-white font-bold text-lg tracking-wide">Research Portal</div>
        <div className="flex space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-white hover:text-gray-200 transition-colors duration-200 ${
                pathname === link.href ? 'font-semibold underline' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
