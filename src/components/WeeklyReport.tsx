import { addDays, format, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { openDatabase } from '../db';
import type { Entry, GroupedEntries } from '../types/dashboard-types';
import { DaySection } from './DaySection';
import { UnknownEntries } from './UnknownEntries';

function groupEntriesByDate(
  entries: Entry[],
  weekStart: Date
): { dateStr: string; weekday: string; grouped: GroupedEntries }[] {
  const dateMap: Record<string, Entry[]> = {};

  for (const entry of entries) {
    const ts = new Date(entry.updatedAt);
    const dateStr = format(ts, 'yyyy-MM-dd');
    console.log(`Grouping entry: ${entry.title} (${entry.updatedAt} -> ${dateStr})`);
    if (!dateMap[dateStr]) dateMap[dateStr] = [];
    dateMap[dateStr].push(entry);
  }

  const results = [];

  for (let i = 6; i >= 0; i--) {
    const day = addDays(weekStart, i);
    const dateStr = format(day, 'yyyy-MM-dd', { locale: enUS });
    const weekday = format(day, 'E', { locale: enUS });

    const logs = dateMap[dateStr] || [];
    const grouped: GroupedEntries = {};

    for (const entry of logs) {
      if (!grouped[entry.category]) grouped[entry.category] = [];
      grouped[entry.category].push(entry);
    }

    results.push({ dateStr, weekday, grouped });
  }

  return results;
}

export const WeeklyReport: FunctionalComponent = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [logsByDay, setLogsByDay] = useState<
    { dateStr: string; weekday: string; grouped: GroupedEntries }[]
  >([]);
  const [unknownEntries, setUnknownEntries] = useState<Entry[]>([]);

  const fetchLogs = async () => {
    const db = await openDatabase();
    const now = new Date();
    now.setDate(now.getDate() + weekOffset * 7);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    // Get entries for the week directly from activity table
    const weekEnd = addDays(weekStart, 7);

    const tx = db.transaction('activity', 'readonly');
    const store = tx.objectStore('activity');
    const index = store.index('updatedAt');

    // Get all entries in the week range
    const range = IDBKeyRange.bound(weekStart.toISOString(), weekEnd.toISOString());

    const allEntries = await new Promise<Entry[]>((resolve) => {
      const req = index.getAll(range);
      req.onsuccess = () => {
        resolve(req.result);
      };
    });

    // Separate known and unknown entries (exclude ignored entries from weekly view)
    const knownEntries = allEntries.filter(
      (entry: Entry) =>
        entry.category !== 'unknown' && !entry.category.toLowerCase().includes('ignored')
    );

    const results = groupEntriesByDate(knownEntries, weekStart);
    setLogsByDay(results);

    // Get all unknown entries (not just this week)
    const allUnknownReq = store.index('category').getAll('unknown');
    const allUnknown = await new Promise<Entry[]>((resolve) => {
      allUnknownReq.onsuccess = () => resolve(allUnknownReq.result);
    });
    setUnknownEntries(allUnknown);
  };

  useEffect(() => {
    fetchLogs();
  }, [weekOffset]);

  const handleCategorized = () => {
    // Refresh the logs after categorization
    fetchLogs();
  };

  return (
    <div class="weekly-report">
      <div class="week-navigation">
        <button type="button" onClick={() => setWeekOffset(weekOffset - 1)}>
          ← Previous Week
        </button>
        <button type="button" onClick={() => setWeekOffset(weekOffset + 1)}>
          Next Week →
        </button>
      </div>
      <div id="weeklyLogs">
        {logsByDay.map(({ dateStr, weekday, grouped }) => (
          <DaySection key={dateStr} dateStr={dateStr} weekday={weekday} grouped={grouped} />
        ))}
      </div>
      {unknownEntries.length > 0 && (
        <UnknownEntries entries={unknownEntries} onCategorized={handleCategorized} />
      )}
    </div>
  );
};
