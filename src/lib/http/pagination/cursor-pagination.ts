import type { Knex } from "knex";

export interface PaginationParams {
    cursor?: string;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
    field: string;
    operator: 'eq' | 'gt' | 'lt' | 'lte' | 'gte' | 'in' | 'like';
    value: string | string[];
}

export interface PaginationMeta {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
}

export function applyCursorPagination(query: Knex.QueryBuilder, params: PaginationParams): Knex.QueryBuilder {
    if(!params.sortBy){
        return query;
    }
    if(params.cursor) {
        const op = params.sortOrder === 'asc' ? '>' : '<';
        query = query.where(params.sortBy, op, params.cursor);
    }
    return query.orderBy(params.sortBy, params.sortOrder).limit(params.limit+1);
}

export function applyFilters(query: Knex.QueryBuilder, filters: FilterParams[]): Knex.QueryBuilder {
    
    for(const filter of filters) {
        switch(filter.operator) {
            case 'eq': query.where(filter.field, filter.value); break;
            case 'gt': query.where(filter.field, '>',filter.value); break;
            case 'lt': query.where(filter.field, '<',filter.value); break;
            case 'lte': query.where(filter.field, '<=',filter.value); break;
            case 'gte': query.where(filter.field, '>=',filter.value); break;
            case 'like': query.whereLike(filter.field, `%${filter.value}%`); break;
            case 'in': query.where(filter.field, Array.isArray(filter.value) ? filter.value: [filter.value]); break;

        }
    }
    return query;
}

export function buildPaginationResult<T>(rows: T[], limit: number, sortBy: string) {
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    let nextCursor = null;
    if(data.length > 0) {
        const lastItem = data[data.length - 1] as any;
        nextCursor = hasMore && lastItem? String(lastItem[sortBy]): null;
    }
    return {
        data,
        meta: {
            nextCursor: nextCursor,
            hasMore: hasMore,
            count: data.length,
        }
    }
}


