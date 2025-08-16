import React, { useEffect, useRef } from 'react';
import { ALL_ROLES, getRoleLabel } from '@/lib/roles';

interface RolesDropdownProps {
  roles: string[];
  setRoles: (roles: string[]) => void;
  rolesDropdownOpen: boolean;
  setRolesDropdownOpen: (open: boolean) => void;
}

const RolesDropdown: React.FC<RolesDropdownProps> = ({
  roles,
  setRoles,
  rolesDropdownOpen,
  setRolesDropdownOpen,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setRolesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setRolesDropdownOpen]);

  const toggleRole = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setRolesDropdownOpen(!rolesDropdownOpen)}
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 transition-all duration-200 border-gray-600 hover:border-orange-500/50"
      >
        <div className="flex items-center justify-between">
          <span className={roles.length > 0 ? 'text-white' : 'text-gray-400'}>
            {roles.length > 0
              ? `${roles.length} rol(es) seleccionado(s)`
              : 'Seleccionar roles'}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${rolesDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {rolesDropdownOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {ALL_ROLES.map(role => (
            <label
              key={role}
              className="flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors duration-200"
            >
              <input
                type="checkbox"
                checked={roles.includes(role)}
                onChange={() => toggleRole(role)}
                className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2 mr-3"
              />
              <span className="text-white text-sm font-medium">
                {getRoleLabel(role)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesDropdown;
