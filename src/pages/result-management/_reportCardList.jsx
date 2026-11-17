/**
 * The list of generated report cards, shared by Generate and View Report Card:
 * search, View (the printed page on screen), Print, and Print All at one card
 * per page in roll-number order.
 */
import { useEffect, useRef, useState } from "react";
import { Card, Button, Badge, Modal } from "../../components/ui";
import { Printer, Eye } from "lucide-react";
import { printReportCards, ReportCardPreview } from "./_reportCardPrint";
import { StudentSearchBar, studentMatches, emptyStudentFilter } from "./_rmShared";

// Normalize a stored report card into the { id, name, rollNumber, … } shape the
// shared student search bar / matcher expects (id = card id).
const cardStudent = (c) => ({ id: c.id, name: c.data?.student?.name, rollNumber: c.data?.student?.rollNumber, registrationNo: c.data?.student?.registrationNo });
/** Cards in roll-number order, the order a class teacher hands them out. */
const byRoll = (a, b) => String(a.data?.student?.rollNumber || "").localeCompare(String(b.data?.student?.rollNumber || ""), undefined, { numeric: true });

/** `openId`: a card to show on screen straight away (e.g. the one just generated). */
export default function ReportCardList({ cards, openId = null }) {
  const [sf, setSf] = useState(emptyStudentFilter);
  const [viewing, setViewing] = useState(null);
  useEffect(() => { setSf(emptyStudentFilter); }, [cards.length]);
  // Open each requested card once, as soon as it is in the list; closing it stays closed.
  const opened = useRef(null);
  useEffect(() => {
    const card = openId && openId !== opened.current ? cards.find((c) => c.id === openId) : null;
    if (card) { opened.current = openId; setViewing(card); }
  }, [openId, cards]);
  const visibleCards = cards.filter((c) => studentMatches(sf, cardStudent(c))).sort(byRoll);

  return (
    <>
      <Card noPadding title={`Report Cards (${cards.length})`}
        action={<Button size="sm" icon={<Printer size={13} />} disabled={!visibleCards.length} onClick={() => printReportCards(visibleCards.map((c) => c.data))}>Print All ({visibleCards.length})</Button>}>
        {cards.some((c) => !c.data?.school) && (
          <p className="px-4 pt-3 text-[12px] text-amber-700">Some cards were generated before photo, rank and attendance were added. Generate them again to print those too.</p>
        )}
        <StudentSearchBar students={cards.map(cardStudent)} value={sf} onChange={setSf} />
        <div className="divide-y divide-slate-100">
          {visibleCards.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
              <div>
                <p className="font-medium text-slate-700 text-[13px]">{c.data?.student?.name}</p>
                <p className="text-[11px] text-slate-400">Roll {c.data?.student?.rollNumber} · {c.data?.percentage}% · Grade {c.data?.grade || "-"}{c.data?.rank ? ` · Rank ${c.data.rank}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                {c.published ? <Badge variant="success">Published</Badge> : <Badge variant="default">Draft</Badge>}
                <Button size="sm" variant="secondary" icon={<Eye size={13} />} onClick={() => setViewing(c)}>View</Button>
                <Button size="sm" variant="secondary" icon={<Printer size={13} />} onClick={() => printReportCards(c.data)}>Print</Button>
              </div>
            </div>
          ))}
          {visibleCards.length === 0 && <div className="px-4 py-8 text-center text-slate-400">No report cards match your search.</div>}
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewing(null)} size="xl" title={`Report Card — ${viewing?.data?.student?.name || ""}`}>
        {viewing && (
          <div className="space-y-3">
            <div className="flex justify-end"><Button size="sm" icon={<Printer size={13} />} onClick={() => printReportCards(viewing.data)}>Print</Button></div>
            <ReportCardPreview card={viewing.data} />
          </div>
        )}
      </Modal>
    </>
  );
}
