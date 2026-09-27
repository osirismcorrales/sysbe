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