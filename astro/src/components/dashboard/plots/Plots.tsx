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

  const { x, speedKn, gustKn, dirDeg, avgSpeedKn } = useMemo(() => {
    const xVals: string[] = [];
    const sKn: number[] = [];
    const gKn: number[] = [];
    const dDeg: number[] = [];

    if (data && Array.isArray(data)) {
      for (const r of data) {
        const t = r.bucket_start ?? '';
        if (!t) continue;
        xVals.push(t);
        sKn.push(mphToKnots(Number(r.windspeedmph_avg ?? 0)));
        gKn.push(mphToKnots(Number(r.windgustmph_max ?? 0)));
        dDeg.push(Number(r.winddir_avg ?? NaN));
      }
    }

    const validSpeeds = sKn.filter((v) => Number.isFinite(v));
    const avg = validSpeeds.length ? validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length : 0;

    return { x: xVals, speedKn: sKn, gustKn: gKn, dirDeg: dDeg, avgSpeedKn: avg };
  }, [data]);

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
                name: 'Wind Gust',
                fill: 'tozeroy',
                line: { color: '#3b82f6', width: 1.5 },
                hovertemplate: '%{y:.1f} kn gust<extra></extra>',
              } as any,
              {
                x,
                y: speedKn,
                type: 'scatter',
                mode: 'lines',
                name: 'Wind Speed',
                line: { color: '#eab308', width: 2 },
                hovertemplate: '%{y:.1f} kn speed<extra></extra>',
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
                hovertemplate: '%{y:.0f}°<extra></extra>',
              } as any,
            ]}
            layout={{
              autosize: true,
              height: 260,
              margin: { l: 40, r: 20, t: 10, b: 40 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              xaxis: { type: 'date', title: '' },
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
    </div>
  );
};

export default Plots;
