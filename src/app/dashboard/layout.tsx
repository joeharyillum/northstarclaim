import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopNav from "@/components/DashboardTopNav";
import TrustFooter from "@/components/TrustFooter";
import ErrorBoundary from "@/components/ErrorBoundary";
import Providers from "@/components/Providers";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            <div style={{
                display: "flex",
                minHeight: "100vh",
                background: "var(--bg-primary)",
                position: "relative",
            }}>

                <DashboardSidebar />
                <div style={{
                    flex: 1,
                    marginLeft: "var(--sidebar-width)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    position: "relative",
                    zIndex: 30,
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
        </Providers>
    );
}
