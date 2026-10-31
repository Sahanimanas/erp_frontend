/**
 * Dashboard v2 · Upcoming Birthdays — current students and staff whose
 * birthday falls in the coming days, soonest first, from the date of birth on
 * their record.
 */
import { useState } from "react";
import { Cake, Gift } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetBirthdaysReportQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, ErrorNote, GradientStat, StatGrid, DataPanel, Panel, Segmented, Picker, Hint, Empty,
  ClassPicker, useClassFilter, FilterBar,
  num, fmtDate, dayLabel,
} from "./_ui";

const when = (d) => (d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`);

export default function BirthdaysPage() {
  usePageTitle("Upcoming Birthdays");
  const [days, setDays] = useState("30");
  const [who, setWho] = useState("all");
  const { classId, className } = useClassFilter();
  const { data, isFetching, error } = useGetBirthdaysReportQuery({ days: Number(days), classId });
  const t = data?.totals;
  const loading = isFetching;
  const people = (data?.people || []).filter((p) => who === "all" || p.kind === who);
  const today = (data?.people || []).filter((p) => p.inDays === 0);
  const week = (data?.people || []).filter((p) => p.inDays < 7).length;
  const range = data ? `${dayLabel(data.from)} to ${dayLabel(data.to)}` : "";

  return (
    <div>
      <ReportHeader title="Upcoming Birthdays" icon={Cake}
        subtitle={className ? `${className} students, soonest first — staff belong to no class` : "Students and staff, soonest first"} />
      <FilterBar>
        <ClassPicker />
        <Picker label="Show the next" value={days} onChange={setDays} minWidth={120}
          options={["7", "15", "30", "60", "90"].map((v) => ({ value: v, label: `${v} days` }))} />
      </FilterBar>
      <ErrorNote error={error} />

      <StatGrid>
        <GradientStat tone="pink" icon={Gift} label="Today" loading={loading} value={num(t?.today)}
          sub={today.length ? today.slice(0, 2).map((p) => p.name).join(", ") + (today.length > 2 ? "…" : "") : "No birthday today"} />
        <GradientStat tone="purple" label="Next 7 days" loading={loading} value={num(week)} sub="students and staff" />
        <GradientStat tone="blue" label="Students" loading={loading} value={num(t?.students)} sub={`in the next ${days} days`} />
        <GradientStat tone="teal" label="Staff" loading={loading} value={num(t?.staff)} sub={`in the next ${days} days`} />
      </StatGrid>

      {!classId && t?.staffWithoutDob > 0 && (
        <Hint>{num(t.staffWithoutDob)} staff have no date of birth on record, so they cannot appear here. Add it from Employee → Edit.</Hint>
      )}

      {today.length > 0 && (
        <Panel className="mb-5" title="Birthdays today" subtitle="Wish them!">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {today.map((p) => (
              <div key={`${p.kind}-${p.id}`} className="flex items-center gap-3 rounded-xl bg-pink-50 px-4 py-3 ring-1 ring-pink-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-600 text-white"><Cake size={18} /></span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-slate-900">{p.name}</p>
                  <p className="truncate text-[12.5px] text-slate-700">{p.kind === "staff" ? "Staff" : "Student"} · {p.detail} · turns {p.turning}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div className="mb-3">
        <Segmented label="Whose birthdays" value={who} onChange={setWho} options={[
          { key: "all", label: "Everyone", count: data?.people?.length },
          { key: "student", label: "Students", count: t?.students },
          { key: "staff", label: "Staff", count: t?.staff },
        ]} />
      </div>

      {!loading && !data?.people?.length ? (
        <Panel><Empty>No birthdays in the next {days} days.</Empty></Panel>
      ) : (
        <DataPanel key={who} title="Upcoming birthdays" subtitle={range} printSubtitle={`Birthdays · ${range}`}
          filename="upcoming-birthdays" loading={loading} rows={people} emptyText="Nobody in this group."
          columns={[
            { key: "date", label: "Birthday", nowrap: true, value: (r) => fmtDate(r.date), sortValue: (r) => r.date },
            { key: "inDays", label: "When", value: (r) => when(r.inDays), sortValue: (r) => r.inDays,
              render: (r) => <span className={r.inDays === 0 ? "font-semibold text-pink-700" : ""}>{when(r.inDays)}</span> },
            { key: "name", label: "Name" },
            { key: "kind", label: "Student / staff", value: (r) => (r.kind === "staff" ? "Staff" : "Student") },
            { key: "detail", label: "Class / designation" },
            { key: "rollNumber", label: "Roll no. / code", nowrap: true },
            { key: "turning", label: "Turns", align: "right" },
            { key: "phone", label: "Phone", nowrap: true },
          ]}
        />
      )}
    </div>
  );
}
