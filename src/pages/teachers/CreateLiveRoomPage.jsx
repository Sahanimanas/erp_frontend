import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button } from "../../components/ui";

export default function CreateLiveRoomPage() {
  usePageTitle("Create Live Room");
  return (
    <div>
      <PageHeader title="Create Live Room" subtitle="Live Class Rooms">
        <Button size="sm">+ Add New</Button>
      </PageHeader>
      <Card>
        <div className="p-10 text-center text-slate-400 text-sm">
          <div className="text-4xl mb-3">🚧</div>
          <p className="font-medium text-slate-600">Create Live Room</p>
          <p className="text-xs mt-1">This section is under construction.</p>
        </div>
      </Card>
    </div>
  );
}
