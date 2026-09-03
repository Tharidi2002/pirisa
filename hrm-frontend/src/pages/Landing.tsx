import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  Briefcase,
  TrendingUp,
  DollarSign,
  BarChart3,
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  Lock,
  X,
  Search,
  HelpCircle,
} from "lucide-react";

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
  color: string;
  longDescription: string;
  highlights: string[];
  benefits: string[];
}

interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  recommended?: boolean;
  ctaText: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("plus");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeModalFeature, setActiveModalFeature] = useState<Feature | null>(null);

  // FAQ Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>("");
  const [modalFaqOpenIndex, setModalFaqOpenIndex] = useState<number | null>(0);

  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Check if user is already logged in, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 96; // 80px fixed navbar height + 16px padding
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const features: Feature[] = [
    {
      id: "directory",
      icon: Users,
      title: "Employee Directory & Records",
      description: "Centralized employee profiles, document management, organizational hierarchy, and team roles.",
      badge: "Core HR",
      color: "from-blue-500 to-indigo-600",
      longDescription:
        "Maintain a single, authoritative source of truth for all employee data across your organization. Store personal details, employment contracts, identity documents (NIC/Passport), bank accounts, emergency contacts, and job histories with bank-grade security and role-based permissions.",
      highlights: [
        "Comprehensive Digital Profiles & Asset Allocation",
        "Secure Storage for Contracts, Certifications & Identity Files",
        "Interactive Departmental & Reporting Hierarchy",
        "Role-Based Access Control (RBAC) & Audit Logs",
        "Automated Employee Onboarding & Offboarding Checklists",
      ],
      benefits: [
        "Eliminate paper files and fragmented Excel records",
        "Ensure instant compliance with labor audit requirements",
        "Empower employees with self-service profile management",
      ],
    },
    {
      id: "attendance",
      icon: Clock,
      title: "Smart Attendance Tracking",
      description: "Real-time clock-in/out monitoring, automated shift scheduling, attendance reports, and leave syncing.",
      badge: "Automation",
      color: "from-emerald-500 to-teal-600",
      longDescription:
        "Track employee presence, punctuality, and work hours effortlessly in real time. Seamlessly integrate with biometric devices, web punch cards, or mobile check-ins. Automatically calculate late arrivals, overtime (OT), early departures, and night shift differentials.",
      highlights: [
        "Biometric Device Syncing & Web Punch Clock-In",
        "Automated Shift Scheduling & Roster Management",
        "Real-Time Late, Absenteeism & Overtime (OT) Engine",
        "Geo-fencing & Remote Work Location Tracking",
        "Instant Monthly Attendance Summaries for Payroll",
      ],
      benefits: [
        "Save 15+ hours monthly on manual attendance consolidation",
        "Eliminate buddy punching and time theft completely",
        "Ensure accurate overtime payouts with automated rules",
      ],
    },
    {
      id: "leave",
      icon: Briefcase,
      title: "Leave Management System",
      description: "Streamlined leave application workflows, multi-level approval matrices, and live balance tracking.",
      badge: "Workflows",
      color: "from-purple-500 to-violet-600",
      longDescription:
        "Simplify annual, casual, medical, maternity, and short leave requests for staff and managers. Configure custom leave policies, carry-forward rules, accrued quotas, and multi-tier approval chains with instant email notifications.",
      highlights: [
        "Customizable Leave Types & Accrual Rules",
        "Multi-Level Manager Approval Chains",
        "Real-Time Leave Balance Calculation & Entitlements",
        "Shared Team Leave Calendar to Prevent Resource Conflicts",
        "Medical Certificate Attachment Uploads",
      ],
      benefits: [
        "Reduce leave approval turnaround time from days to minutes",
        "Prevent understaffing with shared team availability views",
        "Provide full transparency on remaining leave balances to employees",
      ],
    },
    {
      id: "payroll",
      icon: DollarSign,
      title: "Automated Payroll & Slips",
      description: "Error-free salary calculations, statutory deductions, tax reports, and one-click PDF payslips.",
      badge: "Finance",
      color: "from-amber-500 to-orange-600",
      longDescription:
        "Generate compliant, monthly payroll runs with a single click. Automatically pull attendance hours, approved leaves, overtime calculations, bonuses, loan deductions, and statutory contributions (EPF 8%/12%, ETF 3%, PAYE Tax).",
      highlights: [
        "1-Click Automated Monthly Payroll Engine",
        "EPF, ETF, & Statutory Tax Calculation",
        "Custom Allowances, Deductions, Loans & Salary Advances",
        "Automated Confidential PDF Payslip Email Distribution",
        "Direct Bank Transfer Export Files (CSV / Excel)",
      ],
      benefits: [
        "100% accurate salary math aligned with local labor laws",
        "Distribute payslips securely to all employees instantly",
        "Generate bank payment files ready for upload",
      ],
    },
    {
      id: "performance",
      icon: TrendingUp,
      title: "Performance Evaluations",
      description: "360-degree appraisal forms, KPI tracking, goals management, and employee growth analytics.",
      badge: "Growth",
      color: "from-pink-500 to-rose-600",
      longDescription:
        "Drive high performance and continuous growth with structured appraisal cycles. Set quarterly Key Performance Indicators (KPIs) and OKRs, conduct 360-degree peer reviews, manager evaluations, and self-assessments with transparent scoring matrices.",
      highlights: [
        "Customizable Appraisal Questionnaires & Rating Scales",
        "Individual & Departmental KPI / OKR Goal Tracking",
        "Self-Evaluation, Peer Review & Manager Appraisals",
        "Historical Evaluation Records & Growth Charts",
        "Promotion & Merit Salary Increase Recommendations",
      ],
      benefits: [
        "Align team objectives with company growth goals",
        "Provide objective, data-driven feedback to staff",
        "Identify high performers and talent development needs early",
      ],
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Executive Analytics & Reports",
      description: "Deep workforce insights, headcount trends, cost analysis, and exportable custom reports.",
      badge: "Analytics",
      color: "from-cyan-500 to-blue-600",
      longDescription:
        "Gain real-time executive visibility into your organization's workforce metrics. Analyze turnover rates, headcount distribution, payroll expenditure, attendance compliance, and leave utilization through interactive visual dashboards.",
      highlights: [
        "Interactive Executive Workforce Dashboards",
        "Departmental Headcount & Gender Diversity Metrics",
        "Payroll Cost Breakdown & Historical Expenditure Analysis",
        "Attendance Compliance & Absenteeism Heatmaps",
        "1-Click Export to PDF, Excel, and CSV Formats",
      ],
      benefits: [
        "Make informed HR strategic decisions backed by real data",
        "Export audit-ready financial and labor compliance reports",
        "Track HR key metrics effortlessly across departments",
      ],
    },
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: "starter",
      name: "Starter",
      tagline: "Ideal for small teams and growing startups",
      monthlyPrice: "LKR 3,000",
      yearlyPrice: "LKR 2,400",
      period: "/month",
      ctaText: "Select Starter Plan",
      features: [
        "Up to 50 Active Employees",
        "Basic Attendance & Clock-in",
        "Standard Leave Management",
        "Employee Profile Directory",
        "Monthly PDF Reports",
        "Standard Email Support",
      ],
    },
    {
      id: "plus",
      name: "Plus",
      tagline: "Designed for growing medium enterprises",
      monthlyPrice: "LKR 7,500",
      yearlyPrice: "LKR 6,000",
      period: "/month",
      recommended: true,
      ctaText: "Select Plus Plan",
      features: [
        "Up to 500 Active Employees",
        "Advanced Attendance & Shifts",
        "Multi-tier Leave Approval",
        "Full Automated Payroll Engine",
        "Performance Appraisal Module",
        "Priority Support (24/7)",
        "Weekly Custom Analytics",
        "Custom Workflow Setup",
      ],
    },
    {
      id: "business",
      name: "Enterprise",
      tagline: "Tailored solutions for enterprise organizations",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      period: "pricing",
      ctaText: "Select Enterprise Plan",
      features: [
        "Unlimited Employees & Admin Roles",
        "Full Platform Feature Suite",
        "Custom API Integrations & HRIS",
        "Dedicated Account Specialist",
        "Enterprise Security & SLA",
        "Real-Time Executive Analytics",
        "On-Premise or Cloud Deployments",
        "Custom Staff Onboarding & Training",
      ],
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: "Can I switch or upgrade my pricing plan later?",
      answer: "Yes, absolutely! You can upgrade, downgrade, or modify your subscription plan at any time directly from your company settings menu. Plan adjustments will automatically take effect in the next billing cycle.",
    },
    {
      question: "Is employee data stored securely?",
      answer: "We employ enterprise-grade 256-bit SSL encryption, automated daily data backups, strict role-based access control (RBAC), and full compliance with data privacy standards to keep your workforce data safe.",
    },
    {
      question: "How does the registration process work after selecting a plan?",
      answer: "When you click 'Select Plan', you can evaluate and choose your desired plan. Ready to log in? Click 'Get Started' in the header or bottom banner to navigate directly to the login portal.",
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! Every plan includes a 14-day full feature trial with no credit card required upfront so you can evaluate PirisaHR with your team hassle-free.",
    },
  ];

  const moreFaqs: FAQItem[] = [
    {
      question: "Does PirisaHR support biometric fingerprint & face recognition devices?",
      answer: "Yes! PirisaHR seamlessly integrates with standard biometric clocking devices (such as ZKTeco, Hikvision, and Dahua) via automated background API sync or log file import routines.",
    },
    {
      question: "How are EPF, ETF, and APIT / PAYE taxes calculated in payroll?",
      answer: "Our system automatically calculates statutory EPF (8% employee + 12% employer), ETF (3% employer), and progressive APIT/PAYE income tax slabs according to current Inland Revenue Department (IRD) regulations.",
    },
    {
      question: "Can employees view payslips and apply for leave on mobile phones?",
      answer: "Yes, employees get dedicated login credentials to access the self-service portal on any smartphone or desktop to submit leave requests, track approvals, and view or download PDF payslips.",
    },
    {
      question: "What happens if our workforce grows and exceeds our plan's employee limit?",
      answer: "You will receive an in-app notice allowing you to seamlessly upgrade your plan or add extra employee licenses without any service disruption or data migration required.",
    },
    {
      question: "Can we customize leave types, short leave rules, and public holiday calendars?",
      answer: "Absolutely. Admins can create unlimited custom leave categories (Annual, Casual, Medical, Maternity, Duty Leave), set half-day rules, and upload annual mercantile public holiday schedules.",
    },
    {
      question: "Can we export payroll payment files directly for commercial bank transfers?",
      answer: "Yes, PirisaHR generates automated bank payroll files formatted for all major commercial banks (Commercial Bank, Sampath Bank, HNB, BOC, People's Bank, Nations Trust, NDB, etc.).",
    },
    {
      question: "Can we configure multi-level leave approvals (e.g. Supervisor -> Department Head -> HR)?",
      answer: "Yes, Plus and Enterprise plans support customizable multi-tiered approval matrices matching your organizational reporting hierarchy.",
    },
    {
      question: "How long does initial company setup and employee data import take?",
      answer: "Setup takes under 30 minutes! You can bulk-import existing staff records using our simple Excel / CSV template, set up departments, and invite your team immediately.",
    },
    {
      question: "Is customer support and staff training included with our subscription?",
      answer: "Yes! All plans include dedicated email & documentation support. Plus and Enterprise plans include 24/7 priority hotline support and guided onboarding sessions for your HR team.",
    },
    {
      question: "Can we manage probation periods, contract renewals, and appraisals?",
      answer: "Yes, the system tracks probation end dates, sends automated alerts for contract renewals, and provides customizable 360-degree appraisal evaluation forms.",
    },
    {
      question: "Is my company data backed up automatically?",
      answer: "Yes, automatic encrypted offsite backups are performed daily. In addition, company admins can export full employee, attendance, and payroll databases to Excel at any time.",
    },
    {
      question: "Can we restrict admin permissions so HR staff can only manage specific departments?",
      answer: "Yes, role-based access control (RBAC) allows you to grant granular permissions so managers and HR officers can only access data belonging to their assigned departments or branches.",
    },
  ];

  const filteredMoreFaqs = moreFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-50 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={scrollToTop} title="Scroll to top">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Pirisa<span className="text-blue-600">HR</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                Enterprise HR Suite
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => scrollToSection("features")} className="hover:text-blue-600 transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection("pricing")} className="hover:text-blue-600 transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-blue-600 transition-colors">
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 text-center">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-5xl mx-auto mb-6">
          Empower Your Workforce with{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Smart HR Automation
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-normal">
          Streamline employee directories, automated leave tracking, single-click payroll processing, and multi-tier appraisals — all inside one secure platform built for modern teams.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollToSection("pricing")}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Explore Pricing & Plans <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-24 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Comprehensive Suite</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Everything Your HR Team Needs</p>
          <p className="text-slate-600 text-base">
            Designed to replace fragmented spreadsheets with automated, compliant workflows. Click any feature to view detailed specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                onClick={() => setActiveModalFeature(feature)}
                className="group relative bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-4">{feature.description}</p>
                </div>
                <div className="flex items-center text-xs font-semibold text-blue-600 group-hover:text-blue-700 gap-1 pt-3 border-t border-slate-100">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Specification Popup Modal */}
      {activeModalFeature && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalFeature(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeModalFeature.color} flex items-center justify-center shadow-lg`}>
                <activeModalFeature.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  {activeModalFeature.badge}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{activeModalFeature.title}</h3>
              </div>
            </div>

            {/* Detailed Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              {activeModalFeature.longDescription}
            </p>

            {/* System Capabilities */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Key System Capabilities
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeModalFeature.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Benefits */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Key Business Benefits
              </h4>
              <ul className="space-y-2">
                {activeModalFeature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveModalFeature(null);
                  scrollToSection("pricing");
                }}
                className="flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 text-center cursor-pointer"
              >
                View Plans
              </button>
              <button
                onClick={() => setActiveModalFeature(null)}
                className="py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-all text-center cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="scroll-mt-24 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Transparent Plans</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Choose the Right Plan for Your Team</p>
          <p className="text-slate-600 text-base mb-6">
            Click on any plan card below to select it for your workspace.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/60 shadow-inner">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full uppercase font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {pricingPlans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all duration-300 relative flex flex-col justify-between border ${
                  isSelected
                    ? "bg-white border-blue-600 ring-2 ring-blue-600/30 shadow-xl shadow-blue-500/10 transform md:-translate-y-1"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  {plan.recommended ? (
                    <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow-xs">
                      Most Popular
                    </span>
                  ) : (
                    <span />
                  )}
                  {isSelected && (
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-6 h-8">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">{price}</span>
                      {plan.monthlyPrice !== "Custom" && (
                        <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                      )}
                    </div>
                    {billingCycle === "yearly" && plan.monthlyPrice !== "Custom" && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">Billed annually (20% discount applied)</p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlanSelect(plan.id);
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  }`}
                >
                  <span>{isSelected ? "Plan Selected" : plan.ctaText}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Security Banner */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-slate-50 border border-blue-100 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xs">
          <div className="max-w-3xl mx-auto">
            <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">
              Enterprise Grade Compliance & Data Protection
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
              Your organizational data is encrypted using banking-grade security protocols. Enjoy peace of mind with automated daily backups, multi-factor admin login, and role isolation.
            </p>
            <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-600" /> 256-Bit SSL Encrypted</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-600" /> High Availability Cluster</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-cyan-600" /> Regional Data Residency</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-24 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Got Questions?</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Frequently Asked Questions</p>
          <p className="text-slate-600 text-sm">Everything you need to know about starting with PirisaHR.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View More FAQ Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsFaqModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-blue-200 shadow-xs transition-all hover:shadow-md cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Explore More Questions ({moreFaqs.length} More FAQs)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Extended FAQ Knowledgebase Popup Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
                  FAQ Knowledgebase
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">Extended Customer Questions</h3>
              </div>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search questions (e.g., biometric, EPF, payroll, leave, mobile)..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Questions List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {filteredMoreFaqs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No matching questions found for "{faqSearchQuery}". Try searching another term.
                </div>
              ) : (
                filteredMoreFaqs.map((faq, idx) => {
                  const isOpen = modalFaqOpenIndex === idx;
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setModalFaqOpenIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex justify-between items-center gap-3 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>{faq.question}</span>
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 bg-white">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <span className="text-slate-500">Have more questions? Our support team is ready to help.</span>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm"
              >
                Close FAQ Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final CTA Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-white border-2 border-blue-300 rounded-3xl p-8 sm:p-12 text-center shadow-md relative overflow-hidden">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Ready to Modernize Your HR Department?</h3>
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg mb-6 leading-relaxed font-normal">
            Join hundreds of HR professionals streamline attendance, leaves, and payroll effortlessly today.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-md shadow-blue-600/20 hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">PirisaHR System</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              All-in-one Human Resource & Workforce Management platform engineered for speed, accuracy, and operational excellence.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => scrollToSection("features")} className="hover:text-white">Features</button></li>
              <li><button onClick={() => scrollToSection("pricing")} className="hover:text-white">Pricing Plans</button></li>
              <li><button onClick={() => scrollToSection("faq")} className="hover:text-white">FAQ</button></li>
              <li><button onClick={() => navigate("/login")} className="hover:text-white">Sign In</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Support & Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Security Whitepaper</a></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} PirisaHR System. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built with precision for modern workplaces.</p>
        </div>
      </footer>

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Scroll to top"
          className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 border border-blue-400/30 z-40 transition-all transform hover:scale-110 cursor-pointer animate-in fade-in duration-200"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Landing;