import { useEffect, useMemo, useState } from 'react';
import { ecowittHistoryList } from '~/api/django/ecowitt/ecowitt';

type FiveMin = {
  bucket_start?: string;
  windspeedmph_avg?: number;
  windgustmph_max?: number;
  winddir_avg?: number;
  tempf_avg?: number;
  humidity_avg?: number;
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

// For a YYYY-MM-DD (Madrid) date string, return [startZ, endZ] representing
// 00:00–23:59 of that date in Madrid, encoded as if UTC (so axis labels show Madrid clock time)
const getMadridDayBoundsIsoZ = (ymd: string): [string, string] => {
  const start = `${ymd}T00:00:00Z`;
  const end = `${ymd}T23:59:59Z`;
  return [start, end];
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

  const {
    x,
    xTextMadrid,
    speedKn,
    gustKn,
    dirDeg,
    avgSpeedKn,
    tempC,
    humidityPct,
    avgTempC,
    avgHumidityPct,
    tempMinMarker,
    tempMaxMarker,
    humMinMarker,
    humMaxMarker,
    combinedMinMarker,
    combinedMaxMarker,
  } = useMemo(() => {
    const xVals: string[] = [];
    const xText: string[] = [];
    const sKn: number[] = [];
    const gKn: number[] = [];
    const dDeg: number[] = [];
    const tC: number[] = [];
    const hPct: number[] = [];

    if (data && Array.isArray(data)) {
      for (const r of data) {
        const t = r.bucket_start ?? '';
        if (!t) continue;
        // Normalize raw timestamp; build Madrid-local wall time for axis labels (as-if UTC)
        let normalized = t.trim();
        if (!normalized.includes('T') && normalized.includes(' ')) {
          normalized = normalized.replace(' ', 'T');
        }
        if (!/Z|[\+\-]\d{2}:?\d{2}$/.test(normalized)) {
          normalized = normalized + 'Z';
        }
        const dObj = new Date(normalized);
        if (Number.isNaN(dObj.getTime())) continue;
        const madridLocalIso = toMadridLocalIso(normalized);
        if (!madridLocalIso) continue;
        // Use Madrid-local time but append Z, so Plotly renders the label as Madrid clock time
        xVals.push(`${madridLocalIso}Z`);
        xText.push(madridLocalIso.replace('T', ' '));
        sKn.push(mphToKnots(Number(r.windspeedmph_avg ?? 0)));
        gKn.push(mphToKnots(Number(r.windgustmph_max ?? 0)));
        dDeg.push(Number(r.winddir_avg ?? NaN));
        const tempFAvg = Number(r.tempf_avg ?? NaN);
        const tempCVal = (tempFAvg - 32) * (5 / 9);
        tC.push(tempCVal);
        hPct.push(Number(r.humidity_avg ?? NaN));
      }
    }

    const validSpeeds = sKn.filter((v) => Number.isFinite(v));
    const avg = validSpeeds.length ? validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length : 0;

    const validTemps = tC.filter((v) => Number.isFinite(v));
    const avgT = validTemps.length ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 0;
    const validHums = hPct.filter((v) => Number.isFinite(v));
    const avgH = validHums.length ? validHums.reduce((a, b) => a + b, 0) / validHums.length : 0;

    let tMinIdx = -1,
      tMaxIdx = -1,
      tMinVal = Number.POSITIVE_INFINITY,
      tMaxVal = Number.NEGATIVE_INFINITY;
    let hMinIdx = -1,
      hMaxIdx = -1,
      hMinVal = Number.POSITIVE_INFINITY,
      hMaxVal = Number.NEGATIVE_INFINITY;
    let sMinIdx = -1,
      sMaxIdx = -1,
      sMinVal = Number.POSITIVE_INFINITY,
      sMaxVal = Number.NEGATIVE_INFINITY;
    let gMinIdx = -1,
      gMaxIdx = -1,
      gMinVal = Number.POSITIVE_INFINITY,
      gMaxVal = Number.NEGATIVE_INFINITY;

    // Track combined min/max across speed and gust
    let combinedMinIdx = -1;
    let combinedMinVal = Number.POSITIVE_INFINITY;
    let combinedMinSeries: 'speed' | 'gust' | null = null;
    let combinedMaxIdx = -1;
    let combinedMaxVal = Number.NEGATIVE_INFINITY;
    let combinedMaxSeries: 'speed' | 'gust' | null = null;

    for (let i = 0; i < xVals.length; i++) {
      // Temperature
      const tv = tC[i];
      if (Number.isFinite(tv)) {
        if (tv < tMinVal) {
          tMinVal = tv;
          tMinIdx = i;
        }
        if (tv > tMaxVal) {
          tMaxVal = tv;
          tMaxIdx = i;
        }
      }
      // Humidity
      const hv = hPct[i];
      if (Number.isFinite(hv)) {
        if (hv < hMinVal) {
          hMinVal = hv;
          hMinIdx = i;
        }
        if (hv > hMaxVal) {
          hMaxVal = hv;
          hMaxIdx = i;
        }
      }
      // Wind speed
      const sv = sKn[i];
      if (Number.isFinite(sv)) {
        if (sv < sMinVal) {
          sMinVal = sv;
          sMinIdx = i;
        }
        if (sv > sMaxVal) {
          sMaxVal = sv;
          sMaxIdx = i;
        }
      }
      // Gust
      const gv = gKn[i];
      if (Number.isFinite(gv)) {
        if (gv < gMinVal) {
          gMinVal = gv;
          gMinIdx = i;
        }
        if (gv > gMaxVal) {
          gMaxVal = gv;
          gMaxIdx = i;
        }
      }

      // Combined (consider both speed and gust)
      if (Number.isFinite(sv) && sv < combinedMinVal) {
        combinedMinVal = sv;
        combinedMinIdx = i;
        combinedMinSeries = 'speed';
      }
      if (Number.isFinite(gv) && gv < combinedMinVal) {
        combinedMinVal = gv;
        combinedMinIdx = i;
        combinedMinSeries = 'gust';
      }
      if (Number.isFinite(sv) && sv > combinedMaxVal) {
        combinedMaxVal = sv;
        combinedMaxIdx = i;
        combinedMaxSeries = 'speed';
      }
      if (Number.isFinite(gv) && gv > combinedMaxVal) {
        combinedMaxVal = gv;
        combinedMaxIdx = i;
        combinedMaxSeries = 'gust';
      }
    }

    const tempMinMarker =
      tMinIdx >= 0 ? { x: [xVals[tMinIdx]], y: [tC[tMinIdx]], text: [xText[tMinIdx]] } : { x: [], y: [], text: [] };
    const tempMaxMarker =
      tMaxIdx >= 0 ? { x: [xVals[tMaxIdx]], y: [tC[tMaxIdx]], text: [xText[tMaxIdx]] } : { x: [], y: [], text: [] };
    const humMinMarker =
      hMinIdx >= 0 ? { x: [xVals[hMinIdx]], y: [hPct[hMinIdx]], text: [xText[hMinIdx]] } : { x: [], y: [], text: [] };
    const humMaxMarker =
      hMaxIdx >= 0 ? { x: [xVals[hMaxIdx]], y: [hPct[hMaxIdx]], text: [xText[hMaxIdx]] } : { x: [], y: [], text: [] };
    const combinedMinMarker =
      combinedMinIdx >= 0
        ? {
            x: [xVals[combinedMinIdx]],
            y: [combinedMinVal],
            text: [xText[combinedMinIdx]],
            customLabel: combinedMinSeries === 'gust' ? 'Racha mín' : 'Viento mín',
          }
        : ({ x: [], y: [], text: [], customLabel: '' } as any);
    const combinedMaxMarker =
      combinedMaxIdx >= 0
        ? {
            x: [xVals[combinedMaxIdx]],
            y: [combinedMaxVal],
            text: [xText[combinedMaxIdx]],
            customLabel: combinedMaxSeries === 'gust' ? 'Racha máx' : 'Viento máx',
          }
        : ({ x: [], y: [], text: [], customLabel: '' } as any);

    return {
      x: xVals,
      xTextMadrid: xText,
      speedKn: sKn,
      gustKn: gKn,
      dirDeg: dDeg,
      avgSpeedKn: avg,
      tempC: tC,
      humidityPct: hPct,
      avgTempC: avgT,
      avgHumidityPct: avgH,
      tempMinMarker,
      tempMaxMarker,
      humMinMarker,
      humMaxMarker,
      combinedMinMarker,
      combinedMaxMarker,
    };
  }, [data]);

  const hasData = x.length > 0;
  const [rangeStartIsoZ, rangeEndIsoZ] = useMemo(() => getMadridDayBoundsIsoZ(date), [date]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
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
          {/* Temperature */}
          <div className="w-full">
            <div className="text-sm text-gray-500 mb-2">Temperatura</div>
            {PlotComponent ? (
              <PlotComponent
                data={[
                  {
                    x,
                    y: tempC,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Temperatura',
                    line: { color: '#eab308', width: 2 },
                    text: xTextMadrid,
                    hovertemplate: '%{text}<br>%{y:.1f} °C<extra></extra>',
                  } as any,
                  {
                    x: tempMaxMarker.x,
                    y: tempMaxMarker.y,
                    type: 'scatter',
                    mode: 'markers+text',
                    name: 'Máxima',
                    marker: { color: '#f97316', size: 8 },
                    text: tempMaxMarker.y.map((v: number) => v.toFixed(1)),
                    textposition: 'top center',
                    hovertemplate: '%{text} °C<extra>Max</extra>',
                    showlegend: false,
                  } as any,
                  {
                    x: tempMinMarker.x,
                    y: tempMinMarker.y,
                    type: 'scatter',
                    mode: 'markers+text',
                    name: 'Mínima',
                    marker: { color: '#60a5fa', size: 8 },
                    text: tempMinMarker.y.map((v: number) => v.toFixed(1)),
                    textposition: 'bottom center',
                    hovertemplate: '%{text} °C<extra>Min</extra>',
                    showlegend: false,
                  } as any,
                ]}
                layout={{
                  autosize: true,
                  height: 300,
                  margin: { l: 40, r: 20, t: 10, b: 40 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  xaxis: { type: 'date', title: '', range: [rangeStartIsoZ, rangeEndIsoZ] },
                  yaxis: {
                    title: '°C',
                    gridcolor: '#1f2937',
                    zerolinecolor: '#1f2937',
                  },
                  showlegend: false,
                  shapes: [
                    {
                      type: 'line',
                      xref: 'paper',
                      x0: 0,
                      x1: 1,
                      y0: avgTempC,
                      y1: avgTempC,
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

          {/* Humidity */}
          <div className="w-full">
            <div className="text-sm text-gray-500 mb-2">Humedad</div>
            {PlotComponent ? (
              <PlotComponent
                data={[
                  {
                    x,
                    y: humidityPct,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Humedad',
                    line: { color: '#fbbf24', width: 2 },
                    text: xTextMadrid,
                    hovertemplate: '%{text}<br>%{y:.0f}%<extra></extra>',
                  } as any,
                  {
                    x: humMaxMarker.x,
                    y: humMaxMarker.y,
                    type: 'scatter',
                    mode: 'markers+text',
                    name: 'Máxima',
                    marker: { color: '#f97316', size: 8 },
                    text: humMaxMarker.y.map((v: number) => v.toFixed(0)),
                    textposition: 'top center',
                    hovertemplate: '%{text}%<extra>Max</extra>',
                    showlegend: false,
                  } as any,
                  {
                    x: humMinMarker.x,
                    y: humMinMarker.y,
                    type: 'scatter',
                    mode: 'markers+text',
                    name: 'Mínima',
                    marker: { color: '#60a5fa', size: 8 },
                    text: humMinMarker.y.map((v: number) => v.toFixed(0)),
                    textposition: 'bottom center',
                    hovertemplate: '%{text}%<extra>Min</extra>',
                    showlegend: false,
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
                    title: '%',
                    rangemode: 'tozero',
                    gridcolor: '#1f2937',
                    zerolinecolor: '#1f2937',
                  },
                  showlegend: false,
                  shapes: [
                    {
                      type: 'line',
                      xref: 'paper',
                      x0: 0,
                      x1: 1,
                      y0: avgHumidityPct,
                      y1: avgHumidityPct,
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

          {/* Wind speed + gusts */}
          <div className="w-full">
            <div className="text-sm text-gray-500 mb-2">Velocidad del viento</div>
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
                  {
                    x: combinedMaxMarker.x,
                    y: combinedMaxMarker.y,
                    type: 'scatter',
                    mode: 'markers+text',
                    name: 'Máximo',
                    marker: { color: '#f97316', size: 8 },
                    text: combinedMaxMarker.y.map((v: number) => v.toFixed(1)),
                    textposition: 'top center',
                    hovertemplate: '%{text} kn<extra>Máximo</extra>',
                    showlegend: false,
                  } as any,
                  {
                    x: combinedMinMarker.x,
                    y: combinedMinMarker.y,
                    type: 'scatter',
                    mode: 'markers+text',
                    name: 'Mínimo',
                    marker: { color: '#60a5fa', size: 8 },
                    text: combinedMinMarker.y.map((v: number) => v.toFixed(1)),
                    textposition: 'bottom center',
                    hovertemplate: '%{text} kn<extra>Mínimo</extra>',
                    showlegend: false,
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
            <div className="text-sm text-gray-500 mb-2">Dirección del viento</div>
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
