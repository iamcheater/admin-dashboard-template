import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/ui";
import { text } from "../i18n";

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title={text.dashboard.title}
        subtitle={text.dashboard.description}
      />
      <EmptyState>{text.dashboard.placeholder}</EmptyState>
    </>
  );
}
