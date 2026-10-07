import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const AttendanceMark = () => {
  useEffect(() => {
    console.warn(
      "/attendance/mark is deprecated; redirected to unified attendance marking.",
    );
  }, []);

  return <Navigate to="/attendance?view=mark" replace />;
};

export default AttendanceMark;
