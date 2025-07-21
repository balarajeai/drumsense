import { useEffect, useState } from "react";
import { connectToMqtt } from "../mqttClient";

export const StatusOverlay = () => {
  const [status, setStatus] = useState({ bottle_id: "...", status: "...", efficiency: 0 });

  useEffect(() => {
    connectToMqtt((data) => setStatus(data));
  }, []);

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      <div className="p-4 bg-blue-900/70 backdrop-blur-md rounded-lg shadow-lg border border-blue-500/50">
        <h3 className="text-lg font-semibold text-white">Line Efficiency Score</h3>
        <p className="text-3xl font-bold text-white">{status.efficiency.toFixed(1)}%</p>
      </div>
      <div className="p-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold">Bottle ID: {status.bottle_id}</h3>
        <p className="text-sm text-gray-700">Status: {status.status}</p>
      </div>
    </div>
  );
};
