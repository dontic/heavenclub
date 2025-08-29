import { useState } from 'react';
import Realtime from './Realtime';
import Plots from './plots/Plots';

const Weather = () => {
  const [showPlots, setShowPlots] = useState<boolean>(false);

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-3">
        <button
          className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors hover:cursor-pointer"
          onClick={() => setShowPlots(!showPlots)}
        >
          {showPlots ? 'Ver datos' : 'Ver gráficos'}
        </button>
      </div>
      {showPlots ? <Plots /> : <Realtime />}
    </div>
  );
};

export default Weather;
