"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";

type Rez = { id: number; name: string; time: string; guests: number; status: string };
type ByDate = Record<string, Rez[]>;

const STATUS = {
  bekliyor:   { label: "Bekliyor",   cls: "badge badge-yellow" },
  onaylandi:  { label: "Onaylandı",  cls: "badge badge-green" },
  reddedildi: { label: "Reddedildi", cls: "badge badge-red" },
};

const DAYS   = ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];
const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

export default function CalendarDropdown() {
  const today = new Date();
  const [open, setOpen]               = useState(false);
  const [year, setYear]               = useState(today.getFullYear());
  const [month, setMonth]             = useState(today.getMonth() + 1);
  const [data, setData]               = useState<ByDate>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/admin/takvim?year=${year}&month=${month}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [open, year, month]);

  const prevMonth = () => { if (month === 1) { setYear(y => y-1); setMonth(12); } else setMonth(m => m-1); setSelectedDate(null); };
  const nextMonth = () => { if (month === 12) { setYear(y => y+1); setMonth(1); } else setMonth(m => m+1); setSelectedDate(null); };

  const firstDay   = new Date(year, month-1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayStr  = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const dateStr   = (d: number) => `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const selectedRezs = selectedDate ? (data[selectedDate] ?? []) : [];

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100"
        style={{ border: open ? "1px solid #1A73E8" : "1px solid transparent", backgroundColor: open ? "#EBF3FE" : undefined }}
      >
        <Calendar size={15} style={{ color: open ? "#1A73E8" : "#64748B" }} />
        <p className="text-sm font-semibold" style={{ color: "#1A2332" }}>
          {today.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })}
        </p>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full mt-2 right-0 z-50 rounded-2xl overflow-hidden flex"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)",
            minWidth: "320px",
          }}
        >
          {/* Sol: Takvim */}
          <div className="p-5" style={{ width: "320px" }}>
            {/* Ay nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronLeft size={15} style={{ color: "#64748B" }} />
              </button>
              <p className="text-sm font-semibold" style={{ color: "#1A2332" }}>{MONTHS[month-1]} {year}</p>
              <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronRight size={15} style={{ color: "#64748B" }} />
              </button>
            </div>

            {/* Gün başlıkları */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] py-1 font-semibold uppercase tracking-wider" style={{ color: "#94A3B8" }}>{d}</div>
              ))}
            </div>

            {/* Günler */}
            {loading ? (
              <div className="h-36 flex items-center justify-center" style={{ color: "#94A3B8" }}>
                <p className="text-xs">Yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const ds      = dateStr(day);
                  const rezs    = data[ds] ?? [];
                  const isToday    = ds === todayStr;
                  const isSelected = ds === selectedDate;
                  const hasRez     = rezs.length > 0;

                  return (
                    <button
                      key={ds}
                      onClick={() => setSelectedDate(isSelected ? null : ds)}
                      className="relative flex flex-col items-center justify-center h-9 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: isSelected ? "#1A73E8" : isToday ? "#EBF3FE" : "transparent",
                        color: isSelected ? "#fff" : isToday ? "#1A73E8" : "#475569",
                        fontWeight: isToday || isSelected ? 700 : undefined,
                      }}
                    >
                      {day}
                      {hasRez && (
                        <span
                          className="absolute bottom-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ backgroundColor: isSelected ? "#fff" : "#1A73E8", color: isSelected ? "#1A73E8" : "#fff" }}
                        >
                          {rezs.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Alt */}
            <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#1A73E8" }} />
                <span className="text-xs" style={{ color: "#94A3B8" }}>Rezervasyon var</span>
              </div>
              <a href="/admin/rezervasyonlar" className="text-xs font-medium ml-auto" style={{ color: "#1A73E8" }}>
                Tümünü Gör →
              </a>
            </div>
          </div>

          {/* Sağ: Seçili gün */}
          {selectedDate && (
            <div className="p-5 flex-1" style={{ borderLeft: "1px solid #F1F5F9", minWidth: "280px" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1A2332" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                  </p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("tr-TR", { weekday: "long" })}
                  </p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <X size={13} style={{ color: "#94A3B8" }} />
                </button>
              </div>

              {selectedRezs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10" style={{ color: "#94A3B8" }}>
                  <Calendar size={28} className="mb-2 opacity-30" />
                  <p className="text-xs">Bu gün rezervasyon yok</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "240px" }}>
                  {selectedRezs.map(r => {
                    const s = STATUS[r.status as keyof typeof STATUS] ?? STATUS.bekliyor;
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#EBF3FE", color: "#1A73E8" }}>
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "#1A2332" }}>{r.name}</p>
                          <p className="text-[10px]" style={{ color: "#94A3B8" }}>{r.time} – {r.guests} kişi</p>
                        </div>
                        <span className={s.cls}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid #F1F5F9" }}>
                <p className="text-xs" style={{ color: "#94A3B8" }}>
                  <span className="font-semibold" style={{ color: "#1A2332" }}>{selectedRezs.length}</span> rezervasyon
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
