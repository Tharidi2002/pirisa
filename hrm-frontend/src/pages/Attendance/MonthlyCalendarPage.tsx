import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const MonthlyCalendarPage = () => {
  useEffect(() => {
    console.warn(
      "/attendance/calendar is deprecated; redirected to the unified attendance calendar.",
    );
  }, []);

  return <Navigate to="/attendance?view=calendar" replace />;
};

export default MonthlyCalendarPage;
