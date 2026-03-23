import { useMemo } from 'react';
import type { HabitEntry } from '../types';

interface Props {
    entries: HabitEntry[];
    weeks?: number;
}

function toISO(d: Date): string {
    return d.toISOString().split('T')[0];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HeatmapCalendar({ entries, weeks = 18 }: Props) {
    const completedSet = useMemo(
        () => new Set(entries.map((e) => e.date)),
        [entries]
    );

    // Build grid: weeks × 7 cells, newest week last
    const totalDays = weeks * 7;
    const cells = useMemo(() => {
        const today = new Date();
        const result: { date: string; level: number }[] = [];
        for (let i = totalDays - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const iso = toISO(d);
            const done = completedSet.has(iso);
            result.push({ date: iso, level: done ? 4 : 0 });
        }
        return result;
    }, [completedSet, totalDays]);

    // Chunk into columns (weeks)
    const columns: typeof cells[] = [];
    for (let w = 0; w < weeks; w++) {
        columns.push(cells.slice(w * 7, (w + 1) * 7));
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: '3px' }}>
                {/* Day labels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '4px' }}>
                    {DAY_LABELS.map((d, i) => (
                        <div key={i} style={{ height: '14px', fontSize: '9px', color: 'var(--color-text-muted)', lineHeight: '14px', width: '10px' }}>
                            {i % 2 === 0 ? d : ''}
                        </div>
                    ))}
                </div>
                {/* Week columns */}
                {columns.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {week.map((cell) => (
                            <div
                                key={cell.date}
                                className={`timeline-day intensity-${cell.level}`}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '2px',
                                    border: '1px solid var(--color-border-subtle)'
                                }}
                                title={`${cell.date}${cell.level > 0 ? ' ✓' : ''}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Less</span>
                {[0, 1, 2, 3, 4].map((l) => (
                    <div 
                        key={l} 
                        className={`timeline-day intensity-${l}`} 
                        style={{ 
                            width: '10px',
                            height: '10px',
                            borderRadius: '2px',
                            border: '1px solid var(--color-border-subtle)',
                            cursor: 'default' 
                        }} 
                    />
                ))}
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>More</span>
            </div>
        </div>
    );
}
