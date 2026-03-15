import { useState } from 'react';

/**
 * ROI Calculator — Astro React Island (client:visible)
 * Shows potential ROI from AI automation.
 * Intentionally simple: 3 sliders → instant results.
 */

interface ROICalculatorProps {
  sectorName?: string;
}

export default function ROICalculator({ sectorName = 'İşletmeniz' }: ROICalculatorProps) {
  const [employees, setEmployees] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(150);

  // Conservative AI automation savings (40-60% range, we use 50%)
  const automationRate = 0.50;
  const weeksPerYear = 48;

  const annualManualCost = employees * hoursPerWeek * hourlyRate * weeksPerYear;
  const annualSavings = annualManualCost * automationRate;
  const monthlySavings = annualSavings / 12;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-black mb-4 text-center tracking-tight text-white">
          ROI Hesaplayıcı
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg">
          {sectorName} için yapay zeka otomasyonunun potansiyel getirisini hesaplayın
        </p>

        <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-8 md:p-12 space-y-8">
          {/* Slider: Employees */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Manuel Çalışan Sayısı
              </label>
              <span className="text-2xl font-black text-white tabular-nums">{employees}</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #A3E635 0%, #A3E635 ${((employees - 1) / 49) * 100}%, #1F2937 ${((employees - 1) / 49) * 100}%, #1F2937 100%)`
              }}
              aria-label="Manuel çalışan sayısı"
            />
          </div>

          {/* Slider: Hours */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Haftalık Manuel Saat
              </label>
              <span className="text-2xl font-black text-white tabular-nums">{hoursPerWeek}h</span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              step={5}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #A3E635 0%, #A3E635 ${((hoursPerWeek - 5) / 75) * 100}%, #1F2937 ${((hoursPerWeek - 5) / 75) * 100}%, #1F2937 100%)`
              }}
              aria-label="Haftalık manuel çalışma saati"
            />
          </div>

          {/* Slider: Hourly Rate */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Saatlik Maliyet (₺)
              </label>
              <span className="text-2xl font-black text-white tabular-nums">₺{hourlyRate}</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #A3E635 0%, #A3E635 ${((hourlyRate - 50) / 450) * 100}%, #1F2937 ${((hourlyRate - 50) / 450) * 100}%, #1F2937 100%)`
              }}
              aria-label="Saatlik maliyet"
            />
          </div>

          {/* Results */}
          <div className="border-t border-white/10 pt-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/[0.03] rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mevcut Yıllık Maliyet</p>
                <p className="text-2xl md:text-3xl font-black text-red-400">{formatCurrency(annualManualCost)}</p>
              </div>
              <div className="bg-[#A3E635]/5 border border-[#A3E635]/20 rounded-2xl p-6">
                <p className="text-xs font-semibold text-[#A3E635]/70 uppercase tracking-wider mb-2">Yıllık Tasarruf</p>
                <p className="text-2xl md:text-3xl font-black text-[#A3E635]">{formatCurrency(annualSavings)}</p>
              </div>
              <div className="bg-white/[0.03] rounded-2xl p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Aylık Tasarruf</p>
                <p className="text-2xl md:text-3xl font-black text-white">{formatCurrency(monthlySavings)}</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 mt-6">
              * %50 otomasyon oranı ile konservatif tahmin. Gerçek sonuçlar sektöre göre değişir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
