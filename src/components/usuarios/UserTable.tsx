import React from "react";

interface UserTableProps {
  users: any[];
  currentUser: any;
  onEdit: (user: any) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, currentUser, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/90">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Correo</th>
            <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Rol</th>
            <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-left text-xs font-extrabold text-orange-300 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {users.map((user) => {
            const isCurrentUser = !!(currentUser && user.email === currentUser.email);
            return (
              <tr key={user._id} className={isCurrentUser ? 'opacity-60 bg-gray-900' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-white">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-white max-w-[180px] overflow-hidden text-ellipsis" style={{whiteSpace:'nowrap'}}>
                  {user.roles?.map((r: string) => {
                    switch (r) {
                      case 'admin': return 'Administrador';
                      case 'manager': return 'Gerente';
                      case 'staff': return 'Personal';
                      case 'box': return 'Caja';
                      case 'kitchen': return 'Cocina';
                      case 'administration': return 'Administración';
                      case 'Waiter': return 'Mesonero';
                      default: return r.charAt(0).toUpperCase() + r.slice(1);
                    }
                  }).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-white">
                  {user.isActive ? <span className="text-green-400 font-bold">Habilitado</span> : <span className="text-red-400 font-bold">Inhabilitado</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-base text-white">
                  {isCurrentUser ? (
                    <button disabled className="bg-gray-700 text-gray-400 px-3 py-1 rounded-lg font-bold cursor-not-allowed opacity-60">Editar</button>
                  ) : (
                    <button onClick={() => onEdit(user)} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-lg font-bold shadow hover:scale-105 active:scale-95 transition-all">Editar</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
