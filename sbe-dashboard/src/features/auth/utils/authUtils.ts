export interface UserInfo {
    nombre: string;
    username: string;
    role: string;
    initials: string;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function getUserRole(): string | null {
    
    const token = localStorage.getItem('token');

    if (!token) {
        return null;
    }

    try {
        const payload = token.split('.')[1];

        const decodedPayload = JSON.parse(atob(payload));

        return decodedPayload.role ?? null;
    } catch {
        return null;
    }
}

export function getUserInfo(): UserInfo | null {
    const token = localStorage.getItem('token');

    if (!token) {
        return null;
    }

    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));

        const nombre = decoded.nombre ?? decoded.name ?? decoded.sub ?? 'Usuario';
        const username = decoded.sub ?? decoded.username ?? '';
        const role = decoded.role ?? 'Usuario';

        return {
            nombre,
            username,
            role,
            initials: getInitials(nombre),
        };
    } catch {
        return null;
    }
}