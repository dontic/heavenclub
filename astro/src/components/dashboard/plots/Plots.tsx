import { useEffect, useMemo, useState } from 'react';
import { ecowittHistoryList } from '~/api/django/ecowitt/ecowitt';

type FiveMin = {
  bucket_start?: string;
  windspeedmph_avg?: number;
  windgustmph_max?: number;
  winddir_avg?: number;
};

const mphToKnots = (mph: number): number => mph * 0.868976;

const getMadridDateString = (d: Date): string => {
  // Build YYYY-MM-DD in Europe/Madrid timezone
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d);
};

// Convert a timestamp to an ISO-like string in Europe/Madrid timezone (YYYY-MM-DDTHH:mm:ss)
const toMadridLocalIso = (input: string): string => {
  try {
    if (!input) return '';
    let normalized = input.trim();
    if (!normalized.includes('T') && normalized.includes(' ')) {
      normalized = normalized.replace(' ', 'T');
    }
    // If there is no timezone information, assume UTC
    const hasTz = /Z|[\+\-]\d{2}:?\d{2}$/.test(normalized);
    if (!hasTz) {
      normalized = normalized + 'Z';
    }
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return '';

    const datePart = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    const timePart = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
    return `${datePart}T${timePart}`;
  } catch {
    return '';
  }
};

// Compute numeric timezone offset (in minutes) for a given UTC instant in a target IANA zone
const getTimeZoneOffsetMinutes = (utcDate: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(utcDate);

  let y = 0,
    m = 0,
    d = 0,
    hh = 0,
    mm = 0,
    ss = 0;
  for (const p of parts) {
    if (p.type === 'year') y = Number(p.value);
    if (p.type === 'month') m = Number(p.value);
    if (p.type === 'day') d = Number(p.value);
    if (p.type === 'hour') hh = Number(p.value);
    if (p.type === 'minute') mm = Number(p.value);
    if (p.type === 'second') ss = Number(p.value);
  }
  const asUtcMs = Date.UTC(y, m - 1, d, hh, mm, ss);
  const diffMinutes = Math.round((asUtcMs - utcDate.getTime()) / 60000);
  return diffMinutes;
};

// For a YYYY-MM-DD (Madrid) date string, compute [startZ, endZ] ISO strings covering 00:00–23:59 Madrid
const getMadridDayBoundsIsoZ = (ymd: string): [string, string] => {
  const [yy, mo, dd] = ymd.split('-').map((v) => Number(v));
  // Use noon UTC to determine offset for that day in Madrid (stable within the day)
  const noonUtc = new Date(Date.UTC(yy, (mo || 1) - 1, dd || 1, 12, 0, 0));
  const offsetMin = getTimeZoneOffsetMinutes(noonUtc, 'Europe/Madrid');
  const startLocalMs = Date.UTC(yy, (mo || 1) - 1, dd || 1, 0, 0, 0);
  const endLocalMs = Date.UTC(yy, (mo || 1) - 1, dd || 1, 23, 59, 59);
  const startUtcMs = startLocalMs - offsetMin * 60000;
  const endUtcMs = endLocalMs - offsetMin * 60000;
  return [new Date(startUtcMs).toISOString(), new Date(endUtcMs).toISOString()];
};

const Plots = () => {
  const [date, setDate] = useState<string>(() => getMadridDateString(new Date()));
  const [data, setData] = useState<FiveMin[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [PlotComponent, setPlotComponent] = useState<any>(null);

  // Lazy-load Plotly on the client only to avoid SSR issues ("self is not defined")
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (typeof window === 'undefined') return;
      try {
        const mod = await import('react-plotly.js');
        if (!cancelled) setPlotComponent(() => mod.default);
      } catch (e) {
        console.error('Failed to load Plotly', e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await ecowittHistoryList({ date });
        console.debug('rows', rows);
        if (cancelled) return;
        setData(rows as FiveMin[]);
      } catch (e: any) {
        if (cancelled) return;
        setError('No se pudieron obtener los datos.');
        console.error('ecowittHistoryList error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const { x, xTextMadrid, speedKn, gustKn, dirDeg, avgSpeedKn } = useMemo(() => {
    const xVals: string[] = [];
    const xText: string[] = [];
    const sKn: number[] = [];
    const gKn: number[] = [];
    const dDeg: number[] = [];

    if (data && Array.isArray(data)) {
      for (const r of data) {
        const t = r.bucket_start ?? '';
        if (!t) continue;
        // Normalize raw timestamp to ISO UTC for plotting
        let normalized = t.trim();
        if (!normalized.includes('T') && normalized.includes(' ')) {
          normalized = normalized.replace(' ', 'T');
        }
        if (!/Z|[\+\-]\d{2}:?\d{2}$/.test(normalized)) {
          normalized = normalized + 'Z';
        }
        const dObj = new Date(normalized);
        if (Number.isNaN(dObj.getTime())) continue;
        xVals.push(dObj.toISOString());
        xText.push(toMadridLocalIso(normalized).replace('T', ' '));
        sKn.push(mphToKnots(Number(r.windspeedmph_avg ?? 0)));
        gKn.push(mphToKnots(Number(r.windgustmph_max ?? 0)));
        dDeg.push(Number(r.winddir_avg ?? NaN));
      }
    }

    const validSpeeds = sKn.filter((v) => Number.isFinite(v));
    const avg = validSpeeds.length ? validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length : 0;

    return { x: xVals, xTextMadrid: xText, speedKn: sKn, gustKn: gKn, dirDeg: dDeg, avgSpeedKn: avg };
  }, [data]);

  const hasData = x.length > 0;
  const [rangeStartIsoZ, rangeEndIsoZ] = useMemo(() => getMadridDayBoundsIsoZ(date), [date]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-gray-600">Gráficos de viento</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        />
        {loading && <div className="text-sm text-gray-500">Cargando…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      {!loading && !error && !hasData ? (
        <div className="text-sm text-gray-500">No hay datos para esta fecha</div>
      ) : (
        <>
          {/* Wind speed + gusts */}
          <div className="w-full">
            {PlotComponent ? (
              <PlotComponent
                data={[
                  {
                    x,
                    y: gustKn,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Racha',
                    fill: 'tozeroy',
                    line: { color: '#3b82f6', width: 1.5 },
                    text: xTextMadrid,
                    hovertemplate: '%{text}<br>%{y:.1f} kn gust<extra></extra>',
                  } as any,
                  {
                    x,
                    y: speedKn,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Viento',
                    line: { color: '#eab308', width: 2 },
                    text: xTextMadrid,
                    hovertemplate: '%{text}<br>%{y:.1f} kn speed<extra></extra>',
                  } as any,
                ]}
                layout={{
                  autosize: true,
                  height: 320,
                  margin: { l: 40, r: 20, t: 10, b: 40 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: {
                    type: 'date',
                    title: '',
                    range: [rangeStartIsoZ, rangeEndIsoZ],
                  },
                  yaxis: {
                    title: 'kn',
                    rangemode: 'tozero',
                    gridcolor: '#1f2937',
                    zerolinecolor: '#1f2937',
                  },
                  showlegend: true,
                  legend: { orientation: 'h', x: 1, xanchor: 'right', y: 1.1 },
                  shapes: [
                    {
                      type: 'line',
                      xref: 'paper',
                      x0: 0,
                      x1: 1,
                      y0: avgSpeedKn,
                      y1: avgSpeedKn,
                      line: { color: '#94a3b8', dash: 'dash', width: 1 },
                    },
                  ],
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%' }}
              />
            ) : (
              <div className="text-sm text-gray-500">Cargando gráfico…</div>
            )}
          </div>

          {/* Wind direction */}
          <div className="w-full">
            {PlotComponent ? (
              <PlotComponent
                data={[
                  {
                    x,
                    y: dirDeg,
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Wind Direction',
                    marker: { color: '#f59e0b', size: 6, opacity: 0.9 },
                    text: xTextMadrid,
                    hovertemplate: '%{text}<br>%{y:.0f}°<extra></extra>',
                  } as any,
                ]}
                layout={{
                  autosize: true,
                  height: 260,
                  margin: { l: 40, r: 20, t: 10, b: 40 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: { type: 'date', title: '', range: [rangeStartIsoZ, rangeEndIsoZ] },
                  yaxis: {
                    title: '°',
                    range: [0, 360],
                    tickvals: [0, 90, 180, 270, 360],
                    ticktext: ['N', 'E', 'S', 'W', 'N'],
                    gridcolor: '#1f2937',
                    zerolinecolor: '#1f2937',
                  },
                  showlegend: false,
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%' }}
              />
            ) : (
              <div className="text-sm text-gray-500">Cargando gráfico…</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Plots;
