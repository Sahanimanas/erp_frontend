/**
 * Student 360 — search any student, then see their whole record in one place:
 * attendance, fees + receipts, exam results and personal details.
 *
 * Entry point is the search box, so finding a student is the first thing the
 * page asks for rather than something buried in a list. `?id=<studentId>` deep
 * links straight to a profile, which is also what the student list links to.
 *
 * Every endpoint it reads is already live in production (the mobile app's
 * Student 360 uses the same five), so this page adds no backend surface:
 *   GET /students                              search / picker
 *   GET /students/:id                          identity, guardians, documents
 *   GET /attendance/students/:id               attendance rows
 *   GET /payments/students/:id/ledger          fee structure, totals
 *   GET /payments/students/:id/history         receipts
 *   GET /exams/students/:id/performance        marks per exam
 */
import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserSearch, ArrowLeft, Search, Users, ChevronRight, Phone } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { selectAuth } from "../../redux/slices/authSlice";
import { PageHeader, Card, Button, Select, Badge, Avatar, DataTable, EmptyState, Tabs } from "../../components/ui";
import { Loader } from "../../components/loaders/PageLoader";
import { useGetStudentsQuery, useGetStudentQuery } from "../../redux/api/studentsApi";
import { useGetLedgerQuery, useGetPaymentHistoryQuery } from "../../redux/api/paymentsApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import {
  useGetStudent360AttendanceQuery,
  useGetStudent360PerformanceQuery,
  useGetGuardiansQuery,
} from "../../redux/api/student360Api";
import {
  AttendanceSection, FeesSection, ExamsSection, ProfileSection, OverviewSection,
  summariseAttendance, summariseExams, studentName, inr,
} from "./_sections";

// Payments → Student Fee Payment is an admin/accountant screen; teachers can
// reach Student 360 but not that page. Sending them there would land them on a
// 403, so for them the Fees shortcut stays inside this page's Fees tab.
const FEE_COLLECTOR_ROLES = ["SUPER_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "ACCOUNTANT"];

const MODES = [
  { key: "student", label: "By student" },
  { key: "parent", label: "By parent" },
];

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "attendance", label: "Attendance" },
  { key: "fees", label: "Fees" },
  { key: "exams", label: "Exams" },
  { key: "profile", label: "Profile" },
];

export default function Student360Page() {
  usePageTitle("Student Profile");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const studentId = params.get("id") || "";

  const [mode, setMode] = useState("student");     // search by the child, or by their guardian
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");          // only set on submit — no per-keystroke requests
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [tab, setTab] = useState("overview");

  const openStudent = (id) => {
    setParams({ id });
    setTab("overview");
  };
  const backToSearch = () => setParams({});

  /**
   * "Fees" is the one shortcut that leaves this page: collecting a payment is
   * what the office actually wants next, and that screen already accepts the
   * student in `?id=`. Teachers, who cannot open it, stay on the Fees tab.
   */
  const goToFees = () =>
    FEE_COLLECTOR_ROLES.includes(user?.role)
      ? navigate(`/payments/student-fee?id=${studentId}`)
      : setTab("fees");

  /* ── search ──────────────────────────────────────────────────────────── */
  const hasFilter = Boolean(query || classId || sectionId);
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: searchRes, isFetching: searching } = useGetStudentsQuery(
    { search: query || undefined, classId: classId || undefined, sectionId: sectionId || undefined, limit: 50 },
    { skip: Boolean(studentId) || mode !== "student" || !hasFilter }
  );
  const results = searchRes?.data ?? [];

  // Parent mode asks the guardians feed instead, so one father comes back once
  // with every child of his — including siblings whose own record has no
  // father's name typed on it.
  const { data: guardianRes, isFetching: searchingFamilies } = useGetGuardiansQuery(
    { search: query || undefined, limit: 50 },
    { skip: Boolean(studentId) || mode !== "parent" || !query }
  );
  const families = useMemo(() => {
    const rows = Array.isArray(guardianRes) ? guardianRes : guardianRes?.data ?? [];
    // A guardian with no children on file is noise in a "find the family" view.
    return rows.filter((r) => (r.students?.length ?? 0) > 0);
  }, [guardianRes]);

  /* ── one student ─────────────────────────────────────────────────────── */
  const skip = { skip: !studentId };
  const { data: detailRes, isLoading: loadingDetail } = useGetStudentQuery(studentId, skip);
  const { data: attRes, isFetching: loadingAtt } = useGetStudent360AttendanceQuery({ studentId }, skip);
  const { data: ledger, isFetching: loadingFees } = useGetLedgerQuery(studentId, skip);
  const { data: receiptsRes, isFetching: loadingReceipts } = useGetPaymentHistoryQuery(studentId, skip);
  const { data: perfRes, isFetching: loadingExams } = useGetStudent360PerformanceQuery(studentId, skip);

  const student = detailRes?.data ?? detailRes ?? null;
  const records = useMemo(() => (Array.isArray(attRes) ? attRes : attRes?.data ?? []), [attRes]);
  const receipts = useMemo(() => (Array.isArray(receiptsRes) ? receiptsRes : receiptsRes?.data ?? []), [receiptsRes]);
  const summary = useMemo(() => summariseAttendance(records), [records]);
  const exams = useMemo(
    () => summariseExams(Array.isArray(perfRes) ? perfRes : perfRes?.data ?? []),
    [perfRes]
  );

  /* ── search view ─────────────────────────────────────────────────────── */
  if (!studentId) {
    return (
      <div>
        <PageHeader
          title="Student Profile"
          subtitle="Search a student to see attendance, fees, results and details together"
          icon={<UserSearch />}
        />

        <div className="mb-4">
          <Tabs
            tabs={MODES}
            active={mode}
            onChange={(m) => { setMode(m); setQuery(""); setTerm(""); }}
          />
        </div>

        <Card className="mb-4">
          <form
            className={`px-5 py-4 grid grid-cols-1 gap-3 items-end ${
              mode === "student" ? "md:grid-cols-[1fr_180px_180px_auto]" : "md:grid-cols-[1fr_auto]"
            }`}
            onSubmit={(e) => { e.preventDefault(); setQuery(term.trim()); }}
          >
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600">
                {mode === "parent" ? "Parent / guardian name" : "Search"}
              </label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder={
                    mode === "parent"
                      ? "Father's or mother's name — all their children will be listed together"
                      : "Name, roll no, admission no, registration no, phone or father's name"
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white
                             focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                             hover:border-slate-300 transition-all text-slate-700"
                />
              </div>
            </div>

            {/* Class/section narrow a student search; a family spans classes,
                so they are not offered in parent mode. */}
            {mode === "student" && (
              <>
                <Select
                  label="Class"
                  value={classId}
                  onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}
                  options={[{ value: "", label: "All classes" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]}
                />
                <Select
                  label="Section"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  options={[
                    { value: "", label: classId ? "All sections" : "Pick a class" },
                    ...sections.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </>
            )}
            <Button type="submit">Search</Button>
          </form>
        </Card>

        {!(mode === "parent" ? query : hasFilter) ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              {mode === "parent" ? <Users size={24} /> : <UserSearch size={24} />}
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {mode === "parent" ? "Find a family" : "Find a student"}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              {mode === "parent"
                ? "Search a parent and every child of theirs comes back together — open any one to see their full record."
                : "Search by anything the office has on file, then open the student's full record."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
              {(mode === "parent"
                ? ["Father's name", "Mother's name", "Guardian name", "Phone", "Email"]
                : ["Name", "Roll number", "Admission no.", "Registration no.", "Phone", "Father's name"]
              ).map((h) => (
                <span key={h} className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100
                                         text-[10px] font-medium text-slate-500">
                  {h}
                </span>
              ))}
            </div>
          </div>
        ) : mode === "parent" ? (
          <FamilyResults families={families} loading={searchingFamilies} onOpen={openStudent} />
        ) : (
          <Card title="Results" subtitle={searching ? "Searching…" : `${results.length} found`} noPadding>
            <DataTable
              loading={searching}
              emptyText="No student matched that search"
              onRowClick={(r) => openStudent(r.id)}
              columns={[
                {
                  key: "name",
                  label: "Student",
                  render: (_v, r) => (
                    <div className="flex items-center gap-3">
                      <Avatar name={studentName(r)} src={r.photo} />
                      <div>
                        <p className="font-semibold text-slate-800">{studentName(r)}</p>
                        <p className="text-[11px] text-slate-600">Roll {r.rollNumber || "—"}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "class",
                  label: "Class",
                  render: (_v, r) =>
                    r.section?.class?.name ? `${r.section.class.name} · ${r.section.name}` : "—",
                },
                { key: "fatherName", label: "Father", render: (_v, r) => r.fatherName || "—" },
                { key: "phone", label: "Phone", render: (_v, r) => r.user?.phone || "—" },
                {
                  key: "isActive",
                  label: "Status",
                  render: (_v, r) => (
                    <Badge variant={r.isActive === false ? "danger" : "success"}>
                      {r.isActive === false ? "Left" : "Active"}
                    </Badge>
                  ),
                },
                {
                  // No button — the row itself opens the profile; this is just
                  // the affordance that says so.
                  key: "open",
                  label: "",
                  sortable: false,
                  render: () => <ChevronRight size={15} className="text-slate-500" />,
                },
              ]}
              data={results}
            />
          </Card>
        )}
      </div>
    );
  }

  /* ── profile view ────────────────────────────────────────────────────── */
  if (loadingDetail && !student) return <Loader minH="400px" />;

  if (!student) {
    return (
      <div>
        <Button variant="ghost" onClick={backToSearch} className="mb-4">
          <ArrowLeft size={14} /> Back to search
        </Button>
        <EmptyState icon="🤷" title="Student not found" description="This student may have been removed." />
      </div>
    );
  }

  const cls = student.section?.class?.name
    ? `${student.section.class.name} · ${student.section.name}`
    : "No class assigned";

  return (
    <div>
      <Button variant="ghost" onClick={backToSearch} className="mb-4">
        <ArrowLeft size={14} /> Back to search
      </Button>

      {/* Hero — the three numbers an office actually asks for (attendance, dues,
          last result) sit here, so they are readable without opening a tab. */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white px-6 py-5 mb-4">
        <div className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-12 w-44 h-44 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-wrap items-center gap-4">
          {student.photo ? (
            <img
              src={student.photo}
              alt={studentName(student)}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/40 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/15 ring-2 ring-white/30 flex items-center justify-center
                            text-lg font-bold flex-shrink-0">
              {studentName(student).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{studentName(student)}</h2>
            <p className="text-[12px] text-white/70 mt-0.5">
              {cls} · Roll {student.rollNumber || "—"}
              {student.admissionNumber ? ` · ${student.admissionNumber}` : ""}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold">
                {student.isActive === false ? "Left" : "Active"}
              </span>
              {student.user?.phone && (
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold inline-flex items-center gap-1">
                  <Phone size={9} /> {student.user.phone}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
            {[
              { to: "attendance", label: "Attendance", value: `${summary.pct}%`, sub: `${summary.present}/${summary.total} days` },
              { to: "fees", label: "Fees due", value: inr(ledger?.totals?.due ?? 0), sub: `${inr(ledger?.totals?.paid ?? 0)} paid` },
              {
                to: "exams",
                label: "Last exam",
                value: exams[0] ? String(exams[0].obtained) : "—",
                sub: exams[0] ? exams[0].name : "no result",
              },
            ].map((k) => (
              <button
                key={k.label}
                type="button"
                onClick={() => (k.to === "fees" ? goToFees() : setTab(k.to))}
                className="text-left rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 min-w-[92px]
                           transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <p className="text-[9px] uppercase tracking-wider text-white/60">{k.label}</p>
                <p className="text-base font-bold leading-tight mt-0.5 truncate">{k.value}</p>
                <p className="text-[10px] text-white/60 truncate">{k.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === "overview" && (
        <OverviewSection summary={summary} ledger={ledger} exams={exams} student={student} onJump={(t) => (t === "fees" ? goToFees() : setTab(t))}
          feesSubtitle={
            FEE_COLLECTOR_ROLES.includes(user?.role) ? "Opens fee payment" : "Current session"
          }
        />
      )}
      {tab === "attendance" && (
        <AttendanceSection summary={summary} records={records} loading={loadingAtt} />
      )}
      {tab === "fees" && (
        <FeesSection ledger={ledger} receipts={receipts} loading={loadingFees || loadingReceipts} />
      )}
      {tab === "exams" && <ExamsSection exams={exams} loading={loadingExams} />}
      {tab === "profile" && <ProfileSection student={student} />}
    </div>
  );
}

/**
 * Parent-mode results: one card per guardian, every child of theirs listed
 * under them. Clicking a child opens their full 360 — the same destination the
 * student-mode table leads to.
 *
 * Rows come from GET /parents, which returns both real parent logins
 * (source "parent") and guardians it derived from the students themselves
 * (source "student"), siblings already merged.
 */
function FamilyResults({ families, loading, onOpen }) {
  if (loading) return <Loader minH="240px" />;

  if (!families.length) {
    return (
      <EmptyState
        icon="🤷"
        title="No parent matched"
        description="Try just the first name or the phone number — or search by student instead."
      />
    );
  }

  return (
    <div className="space-y-4">
      {families.map((f) => {
        const name = `${f.user?.firstName ?? ""} ${f.user?.lastName ?? ""}`.trim() || "Unknown guardian";
        const kids = f.students ?? [];
        return (
          <Card key={f.id} noPadding className="overflow-hidden">
            <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-b border-slate-100
                            bg-gradient-to-r from-indigo-50/60 to-transparent">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                              text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                <p className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                  {f.relationship || "Guardian"}
                  {f.user?.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={10} /> {f.user.phone}
                    </span>
                  )}
                  {f.source === "student" && <span className="text-slate-500">· no parent login</span>}
                </p>
              </div>
              <Badge variant="indigo">
                <span className="inline-flex items-center gap-1">
                  <Users size={11} />
                  {kids.length} child{kids.length === 1 ? "" : "ren"}
                </span>
              </Badge>
            </div>

            <ul className="divide-y divide-slate-50">
              {kids.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(c.id)}
                    className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-slate-50/70
                               transition-colors focus:outline-none focus:bg-indigo-50/60"
                  >
                    <Avatar name={studentName(c)} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{studentName(c)}</p>
                      <p className="text-[11px] text-slate-600">
                        {c.section?.class?.name ? `${c.section.class.name} · ${c.section.name}` : "No class"}
                        {c.rollNumber ? ` · Roll ${c.rollNumber}` : ""}
                      </p>
                    </div>
                    <ChevronRight size={15} className="text-slate-500 flex-shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
