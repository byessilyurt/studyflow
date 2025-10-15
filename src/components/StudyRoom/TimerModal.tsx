import React, { useState } from 'react';
import { X, Clock, Save } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudyDuration: number;
  currentBreakDuration: number;
  onSave: (studyMinutes: number, breakMinutes: number) => void;
}

export const TimerModal = ({
  isOpen,
  onClose,
  currentStudyDuration,
  currentBreakDuration,
  onSave,
}: TimerModalProps) => {
  const [studyMinutes, setStudyMinutes] = useState(currentStudyDuration);
  const [breakMinutes, setBreakMinutes] = useState(currentBreakDuration);

  const handleSave = () => {
    if (studyMinutes >= 1 && studyMinutes <= 120 && breakMinutes >= 1 && breakMinutes <= 60) {
      onSave(studyMinutes, breakMinutes);
      onClose();
    }
  };

  const presets = [
    { study: 25, break: 5, label: 'Classic Pomodoro' },
    { study: 45, break: 15, label: 'Extended Focus' },
    { study: 15, break: 3, label: 'Quick Sprint' },
    { study: 60, break: 10, label: 'Deep Work' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Customize Timer</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Study Duration
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="120"
                value={studyMinutes}
                onChange={(e) => setStudyMinutes(parseInt(e.target.value))}
                className="flex-1 h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="w-20 text-right">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={studyMinutes}
                  onChange={(e) => setStudyMinutes(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">minutes</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Break Duration
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="60"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
                className="flex-1 h-3 bg-green-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="w-20 text-right">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">minutes</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setStudyMinutes(preset.study);
                    setBreakMinutes(preset.break);
                  }}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <p className="text-sm font-medium text-gray-900">{preset.label}</p>
                  <p className="text-xs text-gray-600">{preset.study}min / {preset.break}min</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
