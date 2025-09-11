"use client";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description?: string;
  slug?: string;   // <-- make optional
  priority?: "low" | "medium" | "high";
  status?: string; // <-- make optional
  due_date?: string;
}


export default function TaskCard({
  task,
  projectSlug,
}: {
  task: Task;
  projectSlug: string;
}) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigating when clicking delete
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      alert(error.message);
    } else {
      router.refresh(); // reloads the page data
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/dashboard/${projectSlug}/tasks/${task.slug}/edit`);
  };

  let priorityClass = "bg-gray-200 text-gray-700";
  if (task.priority === "low") priorityClass = "bg-green-100 text-green-700";
  if (task.priority === "medium") priorityClass = "bg-yellow-100 text-yellow-700";
  if (task.priority === "high") priorityClass = "bg-red-100 text-red-700";

  return (
    <div className="block border p-4 rounded shadow hover:bg-gray-800 hover:text-white transition-colors">
      <Link href={`/dashboard/${projectSlug}/tasks/${task.slug}`}>
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-lg">{task.title}</h4>
          {task.priority && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${priorityClass}`}
            >
              {task.priority}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
          {task.description}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Status: <span className="capitalize">{task.status}</span>
        </p>

        {task.due_date && (
          <p className="text-xs text-gray-500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </Link>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleEdit}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
