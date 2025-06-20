import type { FunctionalComponent } from 'preact';
import type { GroupedEntries } from '../types/dashboard-types';
import { LogEntry } from './LogEntry';

interface DaySectionProps {
  dateStr: string;
  weekday: string;
  grouped: GroupedEntries;
}

export const DaySection: FunctionalComponent<DaySectionProps> = ({ dateStr, weekday, grouped }) => (
  <section class="day-entry">
    <h2>{`${dateStr}(${weekday})`}</h2>
    {Object.keys(grouped).length === 0 ? (
      <div class="log-entry">(No records)</div>
    ) : (
      Object.entries(grouped)
        .sort()
        .map(([category, entries]) => (
          <div key={category}>
            <h3>{category}</h3>
            {entries
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .map((entry) => (
                <LogEntry key={entry.url} entry={entry} />
              ))}
          </div>
        ))
    )}
  </section>
);
