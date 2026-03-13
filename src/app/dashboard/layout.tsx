import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopNav from "@/components/DashboardTopNav";
import TrustFooter from "@/components/TrustFooter";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
            <DashboardSidebar />
            <div style={{ flex: 1, marginLeft: "280px", display: "flex", flexDirection: "column" }}>
                <DashboardTopNav />
                <main style={{ padding: "2rem", flex: 1, overflowY: "auto" }}>
                    <ErrorBoundary>
                        {children}
                        <TrustFooter />
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}
