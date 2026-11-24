// ?ids=1,2,3 for the internal batch endpoints (order-service resolves many rows in ONE call
// instead of one call per row). Duplicates removed; null = invalid (caller answers 400).
export const MAX_BATCH_IDS = 100;

export function parseIdList(raw: unknown): number[] | null {
    const ids = String(raw ?? "").split(",").map(part => part.trim()).filter(part => part.length > 0).map(Number);
    if (ids.length === 0 || ids.length > MAX_BATCH_IDS || ids.some(id => !Number.isSafeInteger(id) || id <= 0)) {
        return null;
    }
    return [...new Set(ids)];
}
