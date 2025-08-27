import { useEffect } from 'react';

type WindGuruProps = {
  className?: string;
};

const WINDGURU_UID = 'wg_fwdg_501065_100_1756293680049';

export default function WindGuru({ className = '' }: WindGuruProps) {
  useEffect(() => {
    const uid = WINDGURU_UID;
    const container = document.getElementById(uid);
    if (!container) return;

    // Reset any previous content/script
    container.innerHTML = '';
    const existingScript = document.querySelector(`script[data-windguru="${uid}"]`);
    if (existingScript) existingScript.parentElement?.removeChild(existingScript);

    const params = [
      's=501065',
      'm=100',
      `uid=${uid}`,
      'wj=knots',
      'tj=c',
      'waj=m',
      'tij=cm',
      'odh=0',
      'doh=24',
      'fhours=240',
      'hrsm=2',
      'vt=forecasts',
      'lng=en',
      'idbs=1',
      'p=WINDSPD,GUST,SMER,TMPE,FLHGT,CDC,APCP1s,RATING',
    ];

    const script = document.createElement('script');
    script.src = `https://www.windguru.cz/js/widget.php?${params.join('&')}`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-windguru', uid);

    document.body.appendChild(script);

    return () => {
      script.parentElement?.removeChild(script);
      const c = document.getElementById(uid);
      if (c) c.innerHTML = '';
    };
  }, []);

  return <div id={WINDGURU_UID} className={className} />;
}
