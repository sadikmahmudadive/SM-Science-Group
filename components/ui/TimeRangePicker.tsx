"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock } from "lucide-react";

interface TimeRangePickerProps {
  startTime: string; // "10:00"
  endTime: string;   // "11:30"
  onChange: (start: string, end: string) => void;
}

const parse24 = (time24: string) => {
  if (!time24) return { h: 10, m: 0, a: "AM" };
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const a = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return { h, m, a };
};

const format24 = (h: number, m: number, a: string) => {
  let hour = h;
  if (a === "PM" && hour < 12) hour += 12;
  if (a === "AM" && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const format12 = (time24: string) => {
  if (!time24) return "";
  const { h, m, a } = parse24(time24);
  return `${h}:${m.toString().padStart(2, '0')} ${a}`;
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const AMPM = ["AM", "PM"];

const ITEM_HEIGHT = 40; // px

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

  // Drag to scroll logic
  const isDragging = useRef(false);
  const startY = useRef(0);
  const scrollTopPos = useRef(0);

  useEffect(() => {
    // Scroll to initial value
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
      // Snap strictly to the rounded position
      target.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    }, 150);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startY.current = e.pageY - (scrollRef.current?.offsetTop || 0);
    scrollTopPos.current = scrollRef.current?.scrollTop || 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

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
            {typeof item === 'number' ? item.toString().padStart(2, '0') : item}
          </div>
        );
      })}
      <div style={{ height: '80px' }} className="flex-shrink-0" />
    </div>
  );
}

export function TimeRangePicker({ startTime, endTime, onChange }: TimeRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");

  // Local state for the picker
  const [startData, setStartData] = useState(parse24(startTime));
  const [endData, setEndData] = useState(parse24(endTime));

  // Sync incoming props
  useEffect(() => {
    if (!isOpen) {
      setStartData(parse24(startTime));
      setEndData(parse24(endTime));
    }
  }, [startTime, endTime, isOpen]);

  const handleTimeChange = (type: "h" | "m" | "a", val: any) => {
    if (activeTab === "start") {
      const newData = { ...startData, [type]: val };
      setStartData(newData);
      onChange(format24(newData.h, newData.m, newData.a), endTime);
    } else {
      const newData = { ...endData, [type]: val };
      setEndData(newData);
      onChange(startTime, format24(newData.h, newData.m, newData.a));
    }
  };

  const currentData = activeTab === "start" ? startData : endData;

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white hover:border-indigo-500 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-700">
            {format12(startTime)} - {format12(endTime)}
          </span>
        </div>
        <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Edit</div>
      </div>

      {/* Picker Dropdown */}
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
              {/* Tabs */}
              <div className="bg-slate-100 p-2 m-4 rounded-full flex relative">
                <motion.div 
                  className="absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white rounded-full shadow-sm"
                  initial={false}
                  animate={{ left: activeTab === 'start' ? '8px' : '50%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => setActiveTab("start")}
                  className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${activeTab === 'start' ? 'text-slate-900' : 'text-slate-500'}`}
                >
                  <div className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">Start</div>
                  <div className={activeTab === 'start' ? 'text-indigo-600' : ''}>{format12(format24(startData.h, startData.m, startData.a))}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("end")}
                  className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${activeTab === 'end' ? 'text-slate-900' : 'text-slate-500'}`}
                >
                  <div className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5">End</div>
                  <div className={activeTab === 'end' ? 'text-indigo-600' : ''}>{format12(format24(endData.h, endData.m, endData.a))}</div>
                </button>
              </div>

              {/* Scroll Wheels Container */}
              <div className="relative h-[200px] flex px-4 select-none">
                {/* Highlight Selection Bar */}
                <div className="absolute top-[80px] left-4 right-4 h-[40px] bg-indigo-50 rounded-xl -z-0" />
                
                <ScrollColumn items={HOURS} value={currentData.h} onChange={(v) => handleTimeChange("h", v)} />
                <ScrollColumn items={MINUTES} value={currentData.m} onChange={(v) => handleTimeChange("m", v)} />
                <ScrollColumn items={AMPM} value={currentData.a} onChange={(v) => handleTimeChange("a", v)} />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Confirm Time
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
