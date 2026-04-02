export type AppUserLike = {
	email?: string | null;
	role?: string | null;
	name?: string | null;
	phone?: string | null;
	city?: string | null;
	address?: string | null;
};

export function getUserRole(user?: AppUserLike | null) {
	return (user?.role || 'customer').toLowerCase();
}

export function isAdminRole(user?: AppUserLike | null) {
	return getUserRole(user) === 'admin';
}
