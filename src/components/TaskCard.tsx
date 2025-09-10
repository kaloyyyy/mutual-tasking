"use client";
import Link from "next/link";

export default function TaskCard({ task, projectSlug }: { task: any; projectSlug: string }) {
  return (
    <Link
      href={`/dashboard/${projectSlug}/tasks/${task.slug}`}
      className="block border p-4 rounded shadow hover:bg-gray-800 hover:text-white transition-colors"
    >
      <h4 className="font-bold text-lg">{task.title}</h4>
      <p className="text-sm text-gray-400">{task.description}</p>
      <p className="text-xs text-gray-500 mt-2">
        Status: <span className="capitalize">{task.status}</span>
      </p>
      {task.due_date && (
        <p className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
      )}
    </Link>
  );
}
