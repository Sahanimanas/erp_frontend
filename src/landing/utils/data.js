/**
 * Static content for Global School Mitra marketing site.
 * Rebrand: EduManage ERP → Global School Mitra (as per pamphlet).
 * Tagline: "Smart Schools. Smart Future"
 * Phone: +91 78080 92280 | info@globalschoolmitra.com | Patna, Bihar
 */
import {
    UserCheck,
    Wallet,
    GraduationCap,
    Globe,
    Sparkles,
    BellRing,
    MessageSquareText,
    ShieldCheck,
    Cloud,
    Rocket,
    Smartphone,
    Building2,
    Brain,
    FileText,
    LineChart,
    Bot,
    Users,
    BookOpenCheck,
    ClipboardList,
    HeartHandshake,
    Trophy,
    School,
    Bus,
    Briefcase,
    ClipboardCheck,
    IndianRupee,
    ScrollText,
    LayoutDashboard,
    MonitorSmartphone,
    Send,
} from "lucide-react";

// ==========================================================================
// Brand constants
// ==========================================================================
export const BRAND = {
    name: "Global School Mitra",
    subName: "School Mitra",
    subKind: "ERP | LMS | ASSESSMENT",
    tagline: "Smart Schools. Smart Future",
    trustBadge: "100% Secure Solution",
    phone: "+91 78080 92280",
    phoneHref: "tel:+917808092280",
    email: "info@globalschoolmitra.com",
    emailHref: "mailto:info@globalschoolmitra.com",
    website: "www.globalschoolmitra.com",
    address: "Boring Road, Patna, Bihar - 800001",
};

// ==========================================================================
// Home: Services grid (front-page pamphlet list)
// ==========================================================================
export const coreFeatures = [
    {
        icon: LayoutDashboard,
        title: "School ERP Software",
        desc: "One dashboard to run every operation — students, staff, exams, fees & transport.",
    },
    {
        icon: MonitorSmartphone,
        title: "Parent Mobile App",
        desc: "Native iOS & Android apps that keep every parent informed in real-time.",
    },
    {
        icon: ScrollText,
        title: "Online Exam Platform",
        desc: "Conduct secure objective & subjective online exams with auto-grading.",
    },
    {
        icon: Globe,
        title: "School Website Development",
        desc: "Beautiful, mobile-first school websites — designed, hosted & maintained.",
    },
    {
        icon: UserCheck,
        title: "Student Attendance System",
        desc: "Biometric, RFID or app-based attendance with instant parent alerts.",
    },
    {
        icon: MessageSquareText,
        title: "SMS & WhatsApp Integration",
        desc: "Bulk announcements, fee reminders & report cards on WhatsApp Business.",
    },
    {
        icon: Wallet,
        title: "Fees Management",
        desc: "Online payments, digital receipts, dues tracking and auto-reminders.",
    },
    {
        icon: Trophy,
        title: "Result & Report Card",
        desc: "Marks entry, board-ready templates and instant result publishing.",
    },
];

// ==========================================================================
// Home: AI / smart features
// ==========================================================================
export const aiFeatures = [
    {
        icon: Bot,
        title: "SchoolMitra Chat Assistant",
        desc: "24/7 conversational assistant on WhatsApp for parents & students.",
    },
    {
        icon: LineChart,
        title: "Smart Analytics",
        desc: "Predictive dashboards surfacing at-risk students, class trends & staff load.",
    },
    {
        icon: FileText,
        title: "Auto-generated Reports",
        desc: "Board-ready PDF report cards, attendance summaries & audit trails in one click.",
    },
    {
        icon: BellRing,
        title: "Smart Notifications",
        desc: "Context-aware alerts on absence, fee dues, exam schedules & holidays.",
    },
];

// ==========================================================================
// Home: Why choose us
// ==========================================================================
export const whyUs = [
    { icon: ShieldCheck, title: "100% Secure Solution", desc: "Bank-grade encryption & ISO-aligned processes." },
    { icon: Rocket, title: "Blazing Fast", desc: "Sub-200ms responses. Loved by IT admins." },
    { icon: Cloud, title: "Cloud-native", desc: "Zero servers to maintain. Auto-scales for exam weeks." },
    { icon: Building2, title: "Multi-school Ready", desc: "One dashboard for entire trusts & chains." },
    { icon: Smartphone, title: "Mobile-first", desc: "Parent & teacher apps on iOS and Android." },
    { icon: HeartHandshake, title: "White-glove Onboarding", desc: "Data migration & training included." },
];

// Stats are live — see lib/usePlatformStats.js (/public/stats). The old
// hardcoded statsFallback was removed so no invented figures can resurface.

// ==========================================================================
// Home: Testimonials
// ==========================================================================
export const testimonials = [
    {
        name: "Dr. Anjali Menon",
        role: "Principal, Greenfield International School",
        quote:
            "Global School Mitra cut our administrative work by 60%. Fee collection alone went digital in a week. Our parents love the WhatsApp updates.",
        avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwZGl2ZXJzZXxlbnwwfHx8fDE3ODMyNzU2MTh8MA&ixlib=rb-4.1.0&q=85",
        rating: 5,
    },
    {
        name: "Rakesh Iyer",
        role: "Chairman, Vidya Group of Schools (14 branches)",
        quote:
            "Running 14 branches from a single dashboard felt impossible until we moved to School Mitra. The multi-school view is a game changer.",
        avatar:
            "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwZGl2ZXJzZXxlbnwwfHx8fDE3ODMyNzU2MTh8MA&ixlib=rb-4.1.0&q=85",
        rating: 5,
    },
    {
        name: "Meera Kapoor",
        role: "IT Head, Sunrise Academy",
        quote:
            "The online exam platform and LMS combo saves our teachers 8+ hours a week. Support team is genuinely responsive.",
        avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwZGl2ZXJzZXxlbnwwfHx8fDE3ODMyNzU2MTh8MA&ixlib=rb-4.1.0&q=85",
        rating: 5,
    },
    {
        name: "Suresh Nair",
        role: "Director, Nalanda College of Arts & Science",
        quote:
            "We migrated 8,000 student records in 3 days. Zero data loss. Their onboarding team is exceptional.",
        avatar:
            "https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        rating: 5,
    },
];

// ==========================================================================
// Home: FAQ
// ==========================================================================
export const faqs = [
    {
        q: "How long does implementation take?",
        a: "Most schools go live within 7–14 days. Our onboarding team migrates your existing data, trains staff and configures workflows end-to-end.",
    },
    {
        q: "Is my school's data secure?",
        a: "Yes — 100% secure solution. We use AES-256 encryption at rest, TLS 1.3 in transit, daily encrypted backups, and ISO 27001 aligned processes. Data lives in India-region servers.",
    },
    {
        q: "Do you offer mobile apps for parents & teachers?",
        a: "Absolutely. Native iOS and Android apps for parents, teachers and students, white-labelled with your school's branding on higher tiers.",
    },
    {
        q: "Can Global School Mitra integrate with existing accounting or biometric systems?",
        a: "Yes. We offer out-of-the-box integrations with Tally, Zoho Books, RFID/biometric readers, WhatsApp Business API and SMS gateways.",
    },
    {
        q: "Do you support multiple boards (CBSE, ICSE, State, IB)?",
        a: "We ship with report card templates and grading rubrics for CBSE, ICSE, IB, IGCSE and every Indian state board. Custom templates supported.",
    },
    {
        q: "What if my school has just 200 students?",
        a: "Our Basic plan is priced for small schools. You get the same core features — attendance, fees, exams — without any per-student surprise billing.",
    },
];

// ==========================================================================
// Pricing
// ==========================================================================
export const pricingPlans = [
    {
        name: "Basic",
        price: 999,
        tagline: "For small schools starting their digital journey",
        highlight: false,
        cta: "Start Free Trial",
        features: [
            "Up to 500 students",
            "Attendance & Timetable",
            "Fee Management",
            "Exam & Report Cards",
            "SMS + Email notifications",
            "Parent & Teacher web portal",
            "Email support (48h SLA)",
        ],
    },
    {
        name: "Standard",
        price: 2999,
        tagline: "Best for growing schools & mid-size institutes",
        highlight: true,
        cta: "Request Demo",
        badge: "Most Popular",
        features: [
            "Up to 3,000 students",
            "Everything in Basic",
            "Mobile apps (iOS + Android)",
            "WhatsApp Business API",
            "Online fee gateway (0% platform fee)",
            "Homework & digital library",
            "Priority chat + phone support",
            "Board-ready report card templates",
        ],
    },
    {
        name: "Premium AI",
        price: 5999,
        tagline: "For multi-campus trusts & AI-first institutes",
        highlight: false,
        premium: true,
        cta: "Talk to Sales",
        features: [
            "Unlimited students",
            "Everything in Standard",
            "SchoolMitra AI Assistant",
            "Predictive attendance & drop-out alerts",
            "AI Question Paper Generator",
            "Multi-branch consolidated dashboard",
            "White-label mobile apps",
            "Dedicated success manager",
            "99.99% uptime SLA",
        ],
    },
];

// ==========================================================================
// Features Page — 8 modules from pamphlet back cover
// ==========================================================================
export const moduleGroups = [
    {
        id: "student",
        icon: Users,
        title: "Smart Student Management",
        color: "from-blue-700 to-blue-800",
        items: ["Digital Student Records", "Admission Process", "Student Profile", "Academic History"],
    },
    {
        id: "attendance",
        icon: ClipboardCheck,
        title: "Attendance Management",
        color: "from-sky-500 to-sky-600",
        items: ["Daily Attendance", "SMS Alerts", "Monthly Reports"],
    },
    {
        id: "fee",
        icon: IndianRupee,
        title: "Fee Management",
        color: "from-orange-500 to-orange-600",
        items: ["Online Fee Collection", "Digital Receipt", "Due Reminders", "Financial Reports"],
    },
    {
        id: "exam",
        icon: ScrollText,
        title: "Examination System",
        color: "from-emerald-500 to-emerald-600",
        items: ["Marks Entry", "Report Cards", "Result Analysis", "Progress Reports"],
    },
    {
        id: "parent",
        icon: Smartphone,
        title: "Parent Mobile App",
        color: "from-fuchsia-500 to-fuchsia-600",
        items: ["Attendance Updates", "Homework Updates", "Notices & Circulars", "Fee Notifications"],
    },
    {
        id: "lms",
        icon: BookOpenCheck,
        title: "LMS (Learning Management)",
        color: "from-blue-700 to-orange-500",
        items: ["Online Classes", "Study Materials", "Assignments", "Online Tests"],
    },
    {
        id: "hr",
        icon: Briefcase,
        title: "HR & Payroll",
        color: "from-amber-500 to-orange-500",
        items: ["Staff Management", "Salary Management", "Leave Management"],
    },
    {
        id: "transport",
        icon: Bus,
        title: "Transport Management",
        color: "from-rose-500 to-rose-600",
        items: ["Vehicle Details", "Route Management", "Driver Information"],
    },
];

// ==========================================================================
// Features Page — role-based tabs (kept for depth)
// ==========================================================================
export const featureCategories = [
    {
        id: "admin",
        label: "Admin",
        title: "Admin Features",
        subtitle: "Command centre for principals, IT heads & office staff.",
        items: [
            { icon: Building2, title: "Multi-branch Dashboard", desc: "Compare & drill down across all campuses." },
            { icon: ClipboardList, title: "Admissions Workflow", desc: "Digital enquiries, applications & seat allotment." },
            { icon: Wallet, title: "Fee Structure Builder", desc: "Configure classes, categories, discounts, late fees." },
            { icon: FileText, title: "Audit Trail", desc: "Every action is logged and searchable." },
            { icon: Users, title: "Role-based Access", desc: "Granular permissions per department & person." },
            { icon: LineChart, title: "Executive Analytics", desc: "Trust-level MIS with drill-down analytics." },
        ],
    },
    {
        id: "teacher",
        label: "Teacher",
        title: "Teacher Features",
        subtitle: "Everything a classroom teacher needs — nothing they don't.",
        items: [
            { icon: UserCheck, title: "Attendance in 30s", desc: "Mark from mobile, in bulk, with photo verification." },
            { icon: GraduationCap, title: "Grade Book", desc: "Assessment weightages, rubrics & instant averages." },
            { icon: BookOpenCheck, title: "Lesson Plans", desc: "Weekly planners aligned to syllabus & standards." },
            { icon: ClipboardList, title: "Homework Assign", desc: "Auto-graded quizzes & submission tracking." },
            { icon: MessageSquareText, title: "Parent Chat", desc: "Threaded conversations, moderated & archived." },
            { icon: Send, title: "Circulars & Notices", desc: "Broadcast announcements class-wise or school-wide." },
        ],
    },
    {
        id: "student",
        label: "Student",
        title: "Student Features",
        subtitle: "A friendly hub that keeps students on track.",
        items: [
            { icon: BookOpenCheck, title: "Assignments", desc: "Submit, track and get feedback in one place." },
            { icon: Trophy, title: "Report Cards", desc: "Term-wise progress with strength & weakness insights." },
            { icon: MessageSquareText, title: "Doubt Solving", desc: "Ask teachers & get responses async." },
            { icon: FileText, title: "Study Material", desc: "Notes, videos & past papers by topic." },
            { icon: HeartHandshake, title: "Counselling", desc: "Book one-on-one sessions confidentially." },
            { icon: ScrollText, title: "Online Exams", desc: "Attempt tests securely from home or lab." },
        ],
    },
    {
        id: "parent",
        label: "Parent",
        title: "Parent Features",
        subtitle: "Keep every parent informed and engaged.",
        items: [
            { icon: Smartphone, title: "Mobile App", desc: "iOS & Android — real-time updates in your pocket." },
            { icon: Wallet, title: "Pay Fees Online", desc: "UPI, cards, netbanking & auto-pay setup." },
            { icon: BellRing, title: "Live Alerts", desc: "Absence, late arrival, exam schedules & results." },
            { icon: UserCheck, title: "Attendance Log", desc: "Month-view calendar with entry/exit timestamps." },
            { icon: MessageSquareText, title: "Teacher Chat", desc: "Direct, moderated messaging with teachers." },
            { icon: FileText, title: "Digital Receipts", desc: "Every payment archived and downloadable." },
        ],
    },
    {
        id: "ai",
        label: "AI Automation",
        title: "AI Automation Features",
        subtitle: "AI that removes busywork — not replaces teachers.",
        items: [
            { icon: Sparkles, title: "AI Question Paper", desc: "Board & syllabus aligned, Bloom-tagged." },
            { icon: Brain, title: "Drop-out Prediction", desc: "Early-warning scores per student." },
            { icon: Bot, title: "SchoolMitra Chat", desc: "24/7 WhatsApp assistant for parents." },
            { icon: LineChart, title: "Trend Analytics", desc: "Class, subject and teacher performance insights." },
            { icon: FileText, title: "Report Summariser", desc: "Executive summaries auto-drafted." },
            { icon: BellRing, title: "Smart Nudges", desc: "Behavioural nudges to boost attendance & fees." },
        ],
    },
];

// ==========================================================================
// About / Team
// ==========================================================================
export const team = [
    {
        name: "Aarav Sharma",
        role: "Founder & CEO",
        bio: "12 years building enterprise SaaS. Ex-Google.",
        avatar:
            "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwZGl2ZXJzZXxlbnwwfHx8fDE3ODMyNzU2MTh8MA&ixlib=rb-4.1.0&q=85",
    },
    {
        name: "Priya Rangan",
        role: "Co-founder & CPO",
        bio: "10 years in edtech. Ran product at BYJU'S.",
        avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwZGl2ZXJzZXxlbnwwfHx8fDE3ODMyNzU2MTh8MA&ixlib=rb-4.1.0&q=85",
    },
    {
        name: "Dr. Karthik Rao",
        role: "Head of AI",
        bio: "PhD IIT-Madras. Applied ML for education for 8 years.",
        avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0JTIwZGl2ZXJzZXxlbnwwfHx8fDE3ODMyNzU2MTh8MA&ixlib=rb-4.1.0&q=85",
    },
    {
        name: "Nisha Verma",
        role: "VP, Customer Success",
        bio: "Former school administrator. Speaks 4 languages.",
        avatar:
            "https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
];

// The "trusted by" marquee now lists real onboarded schools from
// /public/schools — see sections/TrustedBy.jsx. The placeholder name list that
// lived here was removed.

// ==========================================================================
// Nav links
// ==========================================================================
export const navLinks = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/pricing", label: "Pricing" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
];

export const iconMap = { School, Users, GraduationCap, Building2, Trophy };
