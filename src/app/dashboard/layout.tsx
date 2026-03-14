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
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "var(--bg-primary)",
        }}>
            <DashboardSidebar />
            <div style={{
                flex: 1,
                marginLeft: "var(--sidebar-width)",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}>
                <DashboardTopNav />
                <main style={{
                    padding: "1.5rem 2rem",
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                }}>
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                    <TrustFooter />
                </main>
            </div>
        </div>
    );
}
