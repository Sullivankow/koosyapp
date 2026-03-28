import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const menuItems = [
	{ to: '/dashboard', label: 'Dashboard' },
	{ to: '/admin/users', label: 'Utilisateurs' },
	{ to: '/admin/messages', label: 'Messages' },
	{ to: '/admin/notifications', label: 'Notifications' },
	{ to: '/admin/biens', label: 'Biens' },
	{ to: '/admin/reservations', label: 'Réservations' },
	{ to: '/admin/taches', label: 'Tâches' },
	{ to: '/admin/prestations', label: 'Prestations' },
];

const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	return (
		<aside className="h-screen w-60 bg-[#0F172A] text-white flex flex-col shadow-lg">
			<div className="px-4 py-5 flex items-center gap-3 border-b border-white/10">
				<div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00A896] to-[#00897B] flex items-center justify-center shadow-md">
					<span className="text-lg">🔑</span>
				</div>
				<div className="flex flex-col">
					<span className="text-sm font-semibold leading-tight">Koosy Backoffice</span>
					<span className="text-[11px] text-white/60">Administration</span>
				</div>
			</div>

			<nav className="flex-1 px-2 py-4 space-y-1 text-sm">
				{menuItems.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							[
								'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
								isActive ? 'bg-white/10 text-[#4ADE80]' : 'text-white/80 hover:bg-white/5 hover:text-white',
							].join(' ')
						}
					>
						<span className="w-1.5 h-1.5 rounded-full bg-white/40" />
						<span>{item.label}</span>
					</NavLink>
				))}
			</nav>

			<div className="px-4 py-3 border-t border-white/10 flex flex-col gap-2">
				<button
					type="button"
					className="w-full rounded-lg border border-white/20 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
					onClick={() => navigate('/login')}
				>
					Se déconnecter
				</button>
				<div className="text-[11px] text-white/50">
					© {new Date().getFullYear()} Koosy
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;

