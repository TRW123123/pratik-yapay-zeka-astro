import { useMemo, useState } from 'react';

type Mode = 'net-to-gross' | 'gross-to-net';

const presetRates = [1, 10, 20];

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat('tr-TR', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function parseNumber(value: string) {
  const normalized = value.replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function VatCalculator() {
  const [mode, setMode] = useState<Mode>('net-to-gross');
  const [amountInput, setAmountInput] = useState('10000');
  const [rateInput, setRateInput] = useState('20');

  const amount = parseNumber(amountInput);
  const rate = Math.max(0, parseNumber(rateInput));

  const result = useMemo(() => {
    const ratio = rate / 100;

    if (mode === 'net-to-gross') {
      const net = amount;
      const vat = net * ratio;
      const gross = net + vat;
      return { net, vat, gross };
    }

    const gross = amount;
    const net = gross / (1 + ratio);
    const vat = gross - net;
    return { net, vat, gross };
  }, [amount, mode, rate]);

  return (
    <section className="py-16">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl md:p-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#A3E635]/20 bg-[#A3E635]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#A3E635]">
              Pratik Arac
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              KDV hesaplamasini burada hemen yapin
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
              Net tutardan KDV dahil toplam fiyat bulun ya da KDV dahil tutardan matrah ve KDV payini ayristirin.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-400">
            Bu arac, girdiginiz tutar ve orana gore anlik hesap yapar.
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Hesap Yonu</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode('net-to-gross')}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    mode === 'net-to-gross'
                      ? 'border-[#A3E635]/50 bg-[#A3E635]/10 text-white'
                      : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">KDV haric tutardan toplam bul</div>
                  <div className="mt-1 text-xs">Matrah + KDV = toplam fiyat</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('gross-to-net')}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    mode === 'gross-to-net'
                      ? 'border-[#A3E635]/50 bg-[#A3E635]/10 text-white'
                      : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-semibold">KDV dahil tutardan ayristir</div>
                  <div className="mt-1 text-xs">Toplam fiyat icinden KDV ve matrahi cikart</div>
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {mode === 'net-to-gross' ? 'KDV Haric Tutar' : 'KDV Dahil Tutar'}
                </span>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <div className="mb-2 text-xs text-gray-500">TRY</div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    className="w-full bg-transparent text-2xl font-black text-white outline-none"
                    aria-label="Tutar"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  KDV Orani
                </span>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rateInput}
                    onChange={(event) => setRateInput(event.target.value)}
                    className="w-full bg-transparent text-2xl font-black text-white outline-none"
                    aria-label="KDV orani"
                  />
                  <div className="mt-2 text-xs text-gray-500">yuzde (%)</div>
                </div>
              </label>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Hazir Oranlar</p>
              <div className="flex flex-wrap gap-3">
                {presetRates.map((preset) => {
                  const active = Number(rateInput) === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRateInput(String(preset))}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? 'border-[#A3E635]/50 bg-[#A3E635]/10 text-[#A3E635]'
                          : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      %{preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/25 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Sonuc</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/[0.03] p-5">
                <div className="text-sm text-gray-400">Matrah</div>
                <div className="mt-2 text-3xl font-black text-white">{currency.format(result.net)}</div>
              </div>
              <div className="rounded-2xl bg-white/[0.03] p-5">
                <div className="text-sm text-gray-400">KDV Tutari</div>
                <div className="mt-2 text-3xl font-black text-[#A3E635]">{currency.format(result.vat)}</div>
              </div>
              <div className="rounded-2xl border border-[#A3E635]/20 bg-[#A3E635]/5 p-5">
                <div className="text-sm text-gray-400">Toplam Tutar</div>
                <div className="mt-2 text-3xl font-black text-white">{currency.format(result.gross)}</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-gray-400">
              <strong className="font-semibold text-white">{percent.format(rate / 100)}</strong> oranina gore hesaplama yapiliyor.
              Farkli urun veya hizmet kalemlerinde birden fazla oran kullaniyorsaniz belgeyi satir bazinda ayirmak gerekir.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
