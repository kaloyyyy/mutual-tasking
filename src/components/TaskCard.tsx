import Link from "next/link";

export default function TaskCard({ task, projectId }: { task: any; projectId: string }) {
  return (
    <Link
      href={`/dashboard/${projectId}/tasks/${task.id}`}
      className="p-4 bg-gray-800 shadow hover:shadow-lg rounded-md transition"
    >
      <h4 className="font-bold text-gray-100">{task.title}</h4>
      <p className="text-gray-300">{task.description}</p>
      <p className="text-sm text-gray-400 mt-1">{task.status}</p>
    </Link>
  );
}