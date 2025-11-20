// lib/api.ts
export async function apiPost(url: string, data: any) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`API Error ${res.status}: ${msg}`);
    }

    return res.json();
}

export async function apiGet(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API GET failed");
    return res.json();
}
