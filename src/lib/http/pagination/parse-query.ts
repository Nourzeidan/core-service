import type { FilterParams, PaginationParams } from "./cursor-pagination.js";

export function parsePaginationQuery(query: Record<string, any>): PaginationParams{
    const parsedLimit = Number(query.limit);
    return {
        cursor: query.cursor as string,
        limit:  Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(1000, parsedLimit) : 20,
        sortBy: query.sortBy as string,
        sortOrder: query.sortOrder === 'desc' ? 'desc': 'asc'
    }
}

export function parseFilters(query: Record<string, any>, allowedFields: string[]): FilterParams[] {
    const filter = query.filter;
    if(!filter || typeof filter !== 'object') return [];

    const allowedOps = new Set([ 'eq', 'gt', 'lt', 'lte', 'gte', 'in', 'like']);

    return allowedFields.flatMap((field) => {
        const fieldFilters = filter[field];

        if(!fieldFilters || typeof fieldFilters !== 'object') return [];

        return Object.entries(fieldFilters)
        .filter(([op]) => allowedOps.has(op))
        .map(([operator, value]) => ({
            field,
            operator: operator as FilterParams['operator'],
            value: value as string | string[],
        }))
    });
}