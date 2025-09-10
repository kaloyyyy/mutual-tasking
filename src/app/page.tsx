import Auth from "@/components/Auth";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 gap-6 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-indigo-400 text-center">
        Welcome to Mutual Tasking
      </h1>
      <p className="text-center text-gray-400 max-w-md">
        Organize your projects, manage tasks, and collaborate seamlessly with your team.
      </p>
      <div className="w-full flex justify-center max-w-sm">
        <Auth />
      </div>
      <p className="text-sm flex justify-center text-gray-500 mt-4">
        &copy; {new Date().getFullYear()} Mutual Tasking. All rights reserved.
      </p>
    </div>
  );
}
