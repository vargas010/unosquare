import React, { useEffect, useState } from "react";

const UtcClock = () => {
  const [utcTime, setUtcTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-blue-100 text-blue-900 p-2 rounded text-sm mb-4 shadow w-fit">
      <strong>UTC ahora:</strong> {utcTime}
    </div>
  );
};

export default UtcClock;
