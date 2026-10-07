import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const AttendanceReportPage = () => {
  useEffect(() => {
    console.warn(
      "/attendance/report is deprecated; redirected to the unified attendance report.",
    );
  }, []);

  return <Navigate to="/attendance?view=report" replace />;
};

export default AttendanceReportPage;
