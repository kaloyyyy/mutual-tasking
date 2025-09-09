import Auth from "@/components/Auth";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Welcome to Mutual Tasking</h1>
      <Auth />
    </div>
  );
}
