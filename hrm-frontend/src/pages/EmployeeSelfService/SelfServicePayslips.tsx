import React, { useEffect, useState } from "react";
import { FaMoneyBillWave, FaDownload, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Loading from "../../components/Loading/Loading";
import { selfServiceApi, Payslip } from "../../api/services/selfServiceApi";

// Type for jsPDF with autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: Record<string, unknown>) => void;
  lastAutoTable: { finalY: number };
}

const SelfServicePayslips: React.FC = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");

  const employeeId = parseInt(localStorage.getItem("empId") || "0");
  const employeeName = localStorage.getItem("username") || "Employee";

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const data = await selfServiceApi.getMyPayslips(employeeId);
        setPayslips(data);
        if (data.length > 0) {
          const years = [...new Set(data.map((p) => p.year))].sort((a, b) => b - a);
          setSelectedYear(years[0]);
        }
      } catch {
        toast.error("Failed to load payslips");
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchPayslips();
  }, [employeeId]);

  const years = [...new Set(payslips.map((p) => p.year))].sort((a, b) => b - a);

  const filteredPayslips = payslips
    .filter((p) => selectedYear === "all" || p.year === selectedYear)
    .sort((a, b) => {
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      if (a.year !== b.year) return b.year - a.year;
      return months.indexOf(b.month) - months.indexOf(a.month);
    });

  const downloadPDF = (payslip: Payslip) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(20);
    doc.text("PirisaHR Payslip", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`${payslip.month} ${payslip.year}`, 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Employee: ${employeeName}`, 14, 45);
    doc.text(`Period: ${payslip.month} ${payslip.year}`, 14, 52);
    doc.text(`Payslip ID: #${payslip.id}`, 14, 59);

    doc.autoTable({
      startY: 70,
      head: [["Earnings", "Amount (LKR)"]],
      body: [
        ["Basic Salary", payslip.basicSalary.toLocaleString()],
        ["Allowances", payslip.allowance || "-"],
        ["Overtime", payslip.overtimePay.toLocaleString()],
        ["Bonus", payslip.bonusPay || "-"],
        ["Total Earnings", payslip.totalEarnings.toLocaleString()],
      ],
      headStyles: { fillColor: [14, 165, 233] },
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Deductions", "Amount (LKR)"]],
      body: [
        ["EPF (8%)", payslip.epf8.toLocaleString()],
        ["APIT", payslip.appit.toLocaleString()],
        ["Loan", payslip.loan.toLocaleString()],
        ["Other Deductions", payslip.otherDeductions.toLocaleString()],
        ["Total Deductions", payslip.totalDeductions.toLocaleString()],
      ],
      headStyles: { fillColor: [239, 68, 68] },
    });

    doc.setFontSize(14);
    doc.text(
      `Net Salary: LKR ${payslip.netSalary.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 15
    );

    doc.setFontSize(8);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      105,
      290,
      { align: "center" }
    );

    doc.save(`Payslip-${payslip.month}-${payslip.year}.pdf`);
    toast.success("Payslip downloaded!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" text="Loading payslips..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaMoneyBillWave className="text-green-500" /> My Payslips
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Download your monthly payslips
            </p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(e.target.value === "all" ? "all" : parseInt(e.target.value))
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredPayslips.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <FaFilePdf className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No payslips available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPayslips.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-5 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white">
                    <FaMoneyBillWave className="text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{p.month}</p>
                    <p className="text-sm text-gray-500">{p.year}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Basic Salary</span>
                  <span className="font-medium">LKR {p.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Earnings</span>
                  <span className="font-medium text-green-600">
                    + {p.totalEarnings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Deductions</span>
                  <span className="font-medium text-red-500">
                    - {p.totalDeductions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                  <span className="text-gray-700">Net Salary</span>
                  <span className="text-sky-600">LKR {p.netSalary.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => downloadPDF(p)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium"
              >
                <FaDownload /> Download PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelfServicePayslips;