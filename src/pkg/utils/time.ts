import { number } from "zod";

export function hoursToMS(hours: number) :number {
    return hours * 60 * 60 * 1000;
}

export function MinsToMS(mins: number): number {
    return mins * 60 * 1000;
}

export function SecsToMS(sec: number): number {
    return sec *1000;
}

export function daysToMs(day: number): number {
    return day * hoursToMS(24);
}