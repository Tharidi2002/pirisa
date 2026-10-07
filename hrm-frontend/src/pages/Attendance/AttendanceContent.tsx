import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const AttendanceContent = () => {
  useEffect(() => {
    console.warn(
      "/attendance/list is deprecated; redirected to the unified attendance list.",
    );
  }, []);

  return <Navigate to="/attendance?view=list" replace />;
};

export default AttendanceContent;
