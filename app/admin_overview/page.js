import DynamicNavBar from "../components/DynamicNavBar";

export default function AdminOverviewPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <h1 className="admin-title">System Overview</h1>
      </main>
    </>
  );
}