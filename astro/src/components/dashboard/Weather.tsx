import { useEffect, useMemo, useState } from 'react';
import heavenMap from '~/assets/images/heaven-map.png';
import { ecowittRealtimeRetrieve } from '~/api/django/ecowitt/ecowitt';

const mphToKnots = (mph: number): number => mph * 0.868976;

const formatUpdatedAt = (dateutc?: string): string => {
  try {
    if (!dateutc) return '—';
    const normalized = dateutc.includes('T') ? dateutc : dateutc.replace(' ', 'T') + 'Z';
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
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

const degToCompass = (deg: number): string => {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const idx = Math.round((deg % 360) / 22.5) % 16;
  return directions[idx];
};

const Weather = () => {
  const [windspeedKn, setWindspeedKn] = useState<number | null>(null);
  const [windgustKn, setWindgustKn] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);
  const [windDirDeg, setWindDirDeg] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        setError(null);
        const obs = await ecowittRealtimeRetrieve();

        if (cancelled) return;

        const wsMph = Number(obs?.windspeedmph ?? 0);
        const wgMph = Number(obs?.windgustmph ?? 0);
        const wdDegRaw = Number(obs?.winddir);
        const wsKn = mphToKnots(wsMph);
        const wgKn = mphToKnots(wgMph);
        setWindspeedKn(wsKn);
        setWindgustKn(wgKn);
        setUpdatedAt(formatUpdatedAt(obs?.dateutc));
        setWindDirDeg(Number.isFinite(wdDegRaw) ? ((wdDegRaw % 360) + 360) % 360 : null);
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
      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2">Dirección del viento</div>
        <div className="relative w-full rounded-lg border border-gray-200 overflow-hidden">
          <img
            src={heavenMap.src}
            alt="Mapa del emplazamiento de la estación"
            className="w-full h-auto object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {windDirDeg != null && (
              <svg
                width="88"
                height="88"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
                style={{ transform: `rotate(${(windDirDeg + 180) % 360}deg)` }}
                aria-label={`Dirección del viento ${windDirDeg.toFixed(0)}°`}
              >
                {/* Arrow points toward where wind is going; meteorological bearing (from) + 180° */}
                <defs>
                  <linearGradient id="arrowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="44" fill="rgba(255,255,255,0.65)" stroke="#cbd5e1" />
                <polygon points="50,8 60,36 50,30 40,36" fill="url(#arrowGrad)" stroke="#1e3a8a" strokeWidth="1" />
                <line x1="50" y1="30" x2="50" y2="78" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="50" r="5" fill="#1e3a8a" />
              </svg>
            )}
          </div>
          <div className="absolute bottom-2 left-2 rounded bg-white/80 text-gray-900 text-xs px-2 py-1">
            {windDirDeg != null ? (
              <span>
                Dir: {windDirDeg.toFixed(0)}° ({degToCompass(windDirDeg)})
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
