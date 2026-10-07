import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const BulkAttendancePage = () => {
  useEffect(() => {
    console.warn(
      "/attendance/bulk is deprecated; use the attendance marking view instead.",
    );
  }, []);

  return <Navigate to="/attendance?view=mark" replace />;
};

export default BulkAttendancePage;
