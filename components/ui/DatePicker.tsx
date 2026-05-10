"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const getDaysInMonth = (monthStr: string, year: number) => {
  const monthIdx = MONTHS.indexOf(monthStr) + 1;
  return new Date(year, monthIdx, 0).getDate();
};

const ITEM_HEIGHT = 40;

function ScrollColumn({ 
  items, 
  value, 
  onChange 
}: { 
  items: (number|string)[], 
  value: number|string, 
  onChange: (v: any) => void 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<any>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTopPos = useRef(0);

  useEffect(() => {
    if (scrollRef.current && !isScrolling.current) {
      const idx = items.indexOf(value);
      if (idx !== -1) {
        scrollRef.current.scrollTop = idx * ITEM_HEIGHT;
      }
    }
  }, [value, items]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    isScrolling.current = true;
    clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false;
      const target = e.target as HTMLDivElement;
      const index = Math.round(target.scrollTop / ITEM_HEIGHT);
      if (items[index] !== undefined && items[index] !== value) {
        onChange(items[index]);
      }
      target.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    }, 150);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startY.current = e.pageY - (scrollRef.current?.offsetTop || 0);
    scrollTopPos.current = scrollRef.current?.scrollTop || 0;
  };

  const handleMouseLeave = () => isDragging.current = false;
  const handleMouseUp = () => isDragging.current = false;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const y = e.pageY - (scrollRef.current?.offsetTop || 0);
    const walk = (y - startY.current) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollTopPos.current - walk;
    }
  };

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="h-[200px] overflow-y-auto snap-y snap-mandatory flex-1 no-scrollbar relative z-10 cursor-grab active:cursor-grabbing"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div style={{ height: '80px' }} className="flex-shrink-0" />
      {items.map((item) => {
        const isActive = item === value;
        return (
          <div 
            key={item} 
            className={`h-[40px] flex items-center justify-center snap-center text-lg transition-all duration-200 ${
              isActive ? 'font-black text-slate-900 scale-110' : 'font-medium text-slate-400 scale-90'
            }`}
          >
            {typeof item === 'number' && items.length === 31 ? item.toString().padStart(2, '0') : item}
          </div>
        );
      })}
      <div style={{ height: '80px' }} className="flex-shrink-0" />
    </div>
  );
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse initial date (use local parts so timezone doesn't shift it)
  const parseDateStr = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return { y, m, d };
  };

  const parsed = value ? parseDateStr(value) : { y: new Date().getFullYear(), m: new Date().getMonth() + 1, d: new Date().getDate() };
  
  const [day, setDay] = useState(parsed.d);
  const [month, setMonth] = useState(MONTHS[parsed.m - 1]);
  const [year, setYear] = useState(parsed.y);

  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const DAYS = Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1);

  useEffect(() => {
    if (!isOpen && value) {
      const { y, m, d } = parseDateStr(value);
      setDay(d);
      setMonth(MONTHS[m - 1]);
      setYear(y);
    }
  }, [value, isOpen]);

  const handleDayChange = (v: number) => {
    setDay(v);
    updateExternal(year, month, v);
  };

  const handleMonthChange = (v: string) => {
    setMonth(v);
    const maxDays = getDaysInMonth(v, year);
    const newDay = day > maxDays ? maxDays : day;
    setDay(newDay);
    updateExternal(year, v, newDay);
  };

  const handleYearChange = (v: number) => {
    setYear(v);
    const maxDays = getDaysInMonth(month, v);
    const newDay = day > maxDays ? maxDays : day;
    setDay(newDay);
    updateExternal(v, month, newDay);
  };

  const updateExternal = (y: number, m: string, d: number) => {
    const mIdx = (MONTHS.indexOf(m) + 1).toString().padStart(2, '0');
    const dStr = d.toString().padStart(2, '0');
    onChange(`${y}-${mIdx}-${dStr}`);
  };

  const displayDate = `${day.toString().padStart(2, '0')} ${month} ${year}`;

  return (
    <div className="relative w-full">
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white hover:border-emerald-500 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-bold text-slate-700">
            {displayDate}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Edit</div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
              className="fixed top-1/2 left-1/2 w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
              <div className="bg-slate-50 p-4 text-center border-b border-slate-100">
                <h4 className="font-black text-slate-900 text-lg">{displayDate}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select Date</p>
              </div>

              <div className="relative h-[200px] flex px-4 select-none">
                <div className="absolute top-[80px] left-4 right-4 h-[40px] bg-emerald-50 rounded-xl -z-0" />
                <ScrollColumn items={DAYS} value={day} onChange={handleDayChange} />
                <ScrollColumn items={MONTHS} value={month} onChange={handleMonthChange} />
                <ScrollColumn items={YEARS} value={year} onChange={handleYearChange} />
              </div>

              <div className="p-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Confirm Date
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
