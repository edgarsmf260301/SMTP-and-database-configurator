import React, { useRef, useEffect } from "react";

interface RolesDropdownProps {
  roles: string[];
  setRoles: (roles: string[]) => void;
  rolesDropdownOpen: boolean;
  setRolesDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "box", label: "Caja" },
  { value: "kitchen", label: "Cocina" },
  { value: "administration", label: "Administración" },
  { value: "Waiter", label: "Mesonero" },
];

const RolesDropdown: React.FC<RolesDropdownProps> = ({ roles, setRoles, rolesDropdownOpen, setRolesDropdownOpen }) => {
  const rolesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rolesDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(e.target as Node)) {
        setRolesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [rolesDropdownOpen, setRolesDropdownOpen]);

  const handleRoleCheckbox = (role: string) => {
    const exists = roles.includes(role);
    setRoles(exists ? roles.filter(r => r !== role) : [...roles, role]);
  };

  return (
    <div className="relative" ref={rolesDropdownRef}>
      <button
        type="button"
  onClick={e => { e.stopPropagation(); setRolesDropdownOpen((v: boolean) => !v); }}
        className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500 text-base font-semibold min-w-0 overflow-hidden whitespace-nowrap text-ellipsis"
        style={{ textOverflow: 'ellipsis' }}
      >
        <span className="block w-full text-left font-semibold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {roles.length > 0 ? (() => {
            const labels = roles.map(r => ROLES.find(x => x.value === r)?.label || r);
            const joined = labels.join(', ');
            if (joined.length > 38) {
              let str = '';
              let i = 0;
              while (i < labels.length && (str + (str ? ', ' : '') + labels[i]).length < 35) {
                str += (str ? ', ' : '') + labels[i];
                i++;
              }
              return str + '...';
            }
            return joined;
          })() : 'Seleccionar roles'}
        </span>
        <svg className="w-4 h-4 ml-2 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {rolesDropdownOpen && (
        <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-orange-700 rounded-xl shadow-lg p-2 animate-fade-in" onClick={e => e.stopPropagation()}>
          {ROLES.map(r => (
            <label key={r.value} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-800 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={roles.includes(r.value)}
                onChange={() => handleRoleCheckbox(r.value)}
                className="accent-orange-500"
              />
              <span className="text-white text-base">{r.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolesDropdown;
