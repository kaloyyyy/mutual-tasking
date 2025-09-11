"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { generateUniqueSlug } from "@/lib/lib";

interface Profile {
  id: string;
  username: string;
  email?: string;
}

interface Member {
  user_id: string;
  profiles?: Profile[] | Profile | null;
}

export default function CreateTask() {
  const { projectSlug } = useParams() as { projectSlug: string };
  const router = useRouter();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // fetch project ID and members
  useEffect(() => {
    const fetchData = async () => {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (projectError || !project) {
        console.error("Error fetching project:", projectError?.message);
        return;
      }

      setProjectId(project.id);

      const { data: membersData, error: membersError } = await supabase
        .from("project_members")
        .select("user_id, profiles(id, username, email)")
        .eq("project_id", project.id);

      if (membersError) {
        console.error("Error fetching project members:", membersError.message);
        return;
      }

      setMembers(
        (membersData || []).map((m) => ({
          user_id: m.user_id,
          profiles: m.profiles,
        }))
      );
    };

    fetchData();
  }, [projectSlug]);

  const handleSubmit = async () => {
    if (!projectId) {
      alert("Project not found");
      return;
    }

    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("slug")
      .eq("project_id", projectId);

    const slug = generateUniqueSlug(title, existingTasks?.map((t) => t.slug) || []);

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description,
        project_id: projectId,
        slug,
        due_date: dueDate || null,
        priority,
      })
      .select("id")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (task && assignees.length > 0) {
      const { error: assignError } = await supabase.from("task_assignees").insert(
        assignees.map((userId) => ({
          task_id: task.id,
          user_id: userId,
        }))
      );

      if (assignError) alert(assignError.message);
    }

    router.push(`/dashboard/${projectSlug}`);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-gray-900 text-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create Task</h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Task Title</label>
        <input
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
          rows={4}
        />
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
        />
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      {/* Assignees */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Assign to</label>
        <select
          multiple
          value={assignees}
          onChange={(e) =>
            setAssignees(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          className="bg-gray-800 border border-gray-700 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 h-32"
        >
          {members.map((m) => {
            const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
            return (
              <option key={m.user_id} value={m.user_id}>
                {profile?.username || profile?.email || m.user_id}
              </option>
            );
          })}
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!projectId}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition-colors disabled:opacity-50"
      >
        Create Task
      </button>
    </div>
  );
}
