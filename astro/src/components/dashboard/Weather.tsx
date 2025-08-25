import { useEffect, useMemo, useState } from 'react';

type LatestWeatherResponse = {
  ts: number;
  age_s: number;
  raw: {
    windspeedmph?: string;
    windgustmph?: string;
    dateutc?: string; // "YYYY-MM-DD HH:mm:ss" in UTC
  } & Record<string, string | undefined>;
};

const mphToKnots = (mph: number): number => mph * 0.868976;

const formatUpdatedAt = (ts?: number, dateutc?: string): string => {
  try {
    if (Number.isFinite(ts)) {
      // API ts appears to be seconds since epoch (per example). Convert to ms.
      const ms = (ts as number) * 1000;
      const d = new Date(ms);
      return d.toLocaleString();
    }
    if (dateutc) {
      // Treat dateutc as UTC and render in local time
      const d = new Date(dateutc.replace(' ', 'T') + 'Z');
      return d.toLocaleString();
    }
  } catch {}
  return '—';
};

const getKnColorClass = (valueKn: number): string => {
  if (valueKn < 10) return 'text-gray-600';
  if (valueKn < 15) return 'text-blue-600';
  if (valueKn < 25) return 'text-green-600';
  if (valueKn < 30) return 'text-orange-500';
  return 'text-red-600';
};

const Weather = () => {
  const [windspeedKn, setWindspeedKn] = useState<number | null>(null);
  const [windgustKn, setWindgustKn] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        setError(null);
        const resp = await fetch('https://weather.heavenclub.es/latest', { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json: LatestWeatherResponse = await resp.json();

        if (cancelled) return;

        const wsMph = parseFloat(json.raw?.windspeedmph || '0');
        const wgMph = parseFloat(json.raw?.windgustmph || '0');
        const wsKn = mphToKnots(wsMph);
        const wgKn = mphToKnots(wgMph);
        setWindspeedKn(wsKn);
        setWindgustKn(wgKn);
        setUpdatedAt(formatUpdatedAt(json.ts, json.raw?.dateutc));
      } catch (e: any) {
        if (cancelled) return;
        setError('No se pudo obtener el tiempo ahora mismo.');
        console.error('Weather fetch error', e);
      }
    };

    fetchLatest();
    const iv = setInterval(fetchLatest, 60_000); // refresh every minute
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const content = useMemo(() => {
    if (error) {
      return <div className="text-sm text-red-600">{error}</div>;
    }
    if (windspeedKn == null || windgustKn == null) {
      return <div className="text-sm text-gray-500">Cargando…</div>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Viento</div>
          <div className={`font-semibold text-4xl ${getKnColorClass(windspeedKn)}`}>
            {windspeedKn.toFixed(1)} <span className="text-base font-normal text-gray-500">kn</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Racha</div>
          <div className={`font-semibold text-4xl ${getKnColorClass(windgustKn)}`}>
            {windgustKn.toFixed(1)} <span className="text-base font-normal text-gray-500">kn</span>
          </div>
        </div>
      </div>
    );
  }, [error, windspeedKn, windgustKn]);

  return (
    <div className="w-full">
      <div className="text-sm text-gray-600 mb-3">Última actualización: {updatedAt}</div>
      {content}
    </div>
  );
};

export default Weather;
