import React, { useEffect, useState } from "react";
import { connectToMqtt } from "../mqttClient";

export const StatusOverlay = () => {
  const [status, setStatus] = useState({ bottle_id: "...", status: "..." });

  useEffect(() => {
    connectToMqtt((data) => setStatus(data));
  }, []);

  return (
    <div className="absolute top-4 left-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold">Bottle ID: {status.bottle_id}</h3>
      <p className="text-sm text-gray-700">Status: {status.status}</p>
    </div>
  );
};
