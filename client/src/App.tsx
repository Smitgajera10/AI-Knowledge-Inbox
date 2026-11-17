import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AssistantPage } from "./pages/AssistantPage";
import { InboxPage } from "./pages/InboxPage";
import { LogsPage } from "./pages/LogsPage";

export function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<InboxPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
