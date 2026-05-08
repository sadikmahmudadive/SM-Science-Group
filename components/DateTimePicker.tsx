"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";

interface DateTimePickerProps {
  value: string;
  onChange: (datetime: string) => void;
  label?: string;
}

export function DateTimePicker({ value, onChange, label }: DateTimePickerProps) {
  const [date, setDate] = useState(value ? value.split("T")[0] : "");
  const [time, setTime] = useState(value ? value.split("T")[1]?.substring(0, 5) : "");

  const handleChange = (newDate: string, newTime: string) => {
    setDate(newDate);
    setTime(newTime);
    
    if (newDate && newTime) {
      const datetime = `${newDate}T${newTime}:00`;
      onChange(datetime);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => handleChange(e.target.value, time)}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="time"
            value={time}
            onChange={(e) => handleChange(date, e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
