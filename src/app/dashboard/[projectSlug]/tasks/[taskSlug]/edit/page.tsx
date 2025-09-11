"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { generateUniqueSlug } from "@/lib/lib";
import BackButton from "@/components/BackButton";

interface Profile {
  id: string;
  username: string;
  email?: string;
}


interface TaskAssignee {
  user_id: string;
}




interface Member {
  user_id: string;
  profiles?: Profile[] | Profile | null;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  slug: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
  project_id: string;
}

export default function EditTaskPage() {
  const { projectSlug, taskSlug } = useParams() as {
    projectSlug: string;
    taskSlug: string;
  };
  const router = useRouter();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Fetch task + project members
  useEffect(() => {
    const fetchData = async () => {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (projectError || !project) return setProjectId(null);
      setProjectId(project.id);

      // Fetch task
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("slug", taskSlug)
        .eq("project_id", project.id)
        .single();

      if (taskError || !taskData) return setTask(null);
      setTask(taskData);
      setTitle(taskData.title);
      setDescription(taskData.description || "");
      setDueDate(taskData.due_date || "");
      setPriority(taskData.priority || "medium");

      // Fetch project members
      const { data: membersData } = await supabase
        .from("project_members")
        .select("user_id, profiles(id, username, email)")
        .eq("project_id", project.id);

      setMembers(membersData || []);

      // Fetch task assignees
      const { data: taskAssignees } = await supabase
        .from("task_assignees")
        .select("user_id")
        .eq("task_id", taskData.id);

setAssignees(taskAssignees?.map((a: TaskAssignee) => a.user_id) || []);   
    };

    fetchData();
  }, [projectSlug, taskSlug]);

  const handleUpdate = async () => {
    if (!task || !projectId) return;

    let slug = task.slug;
    if (title !== task.title) {
      const { data: existingTasks } = await supabase
        .from("tasks")
        .select("slug")
        .eq("project_id", projectId);

      slug = generateUniqueSlug(title, existingTasks?.map((t) => t.slug) || []);
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        title,
        description,
        due_date: dueDate || null,
        priority,
        slug,
      })
      .eq("id", task.id);

    if (error) return alert(error.message);

    // Reset assignees
    await supabase.from("task_assignees").delete().eq("task_id", task.id);
    if (assignees.length > 0) {
      await supabase.from("task_assignees").insert(
        assignees.map((userId) => ({
          task_id: task.id,
          user_id: userId,
        }))
      );
    }

    router.push(`/dashboard/${projectSlug}/tasks/${slug}`);
  };

  if (!task)
    return (
      <div className="p-6 text-gray-400 text-lg font-medium flex justify-center items-center min-h-[60vh]">
        Loading...
      </div>
    );

return (
  <div className="max-w-lg mx-auto mt-10 bg-gray-900 text-gray-100 p-8 rounded-xl shadow-xl">
    <h2 className="text-3xl font-semibold mb-6">Edit Task</h2>

    {/* Title */}
    <div className="mb-5">
      <label className="block mb-2 font-medium text-lg">Task Title</label>
      <input
        type="text"
        placeholder="Enter task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-gray-800 border border-gray-700 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 text-lg"
      />
    </div>

    {/* Description */}
    <div className="mb-5">
      <label className="block mb-2 font-medium text-lg">Description</label>
      <textarea
        placeholder="Enter task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-gray-800 border border-gray-700 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 text-lg"
        rows={5}
      />
    </div>

    {/* Due Date */}
    <div className="mb-5">
      <label className="block mb-2 font-medium text-lg">Due Date</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="bg-gray-800 border border-gray-700 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 text-lg"
      />
    </div>

    {/* Priority */}
    <div className="mb-5">
      <label className="block mb-2 font-medium text-lg">Priority</label>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
        className="bg-gray-800 border border-gray-700 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 text-lg"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
    </div>

    {/* Assignees */}
    <div className="mb-6">
      <label className="block mb-2 font-medium text-lg">Assign to</label>
      <select
        multiple
        value={assignees}
        onChange={(e) =>
          setAssignees(Array.from(e.target.selectedOptions, (o) => o.value))
        }
        className="bg-gray-800 border border-gray-700 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 text-lg h-36"
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

    {/* Update Button */}
    <button
      onClick={handleUpdate}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded-lg shadow-md text-lg transition-colors mb-4"
    >
      Save Changes
    </button>

    {/* Back Button */}
    <BackButton className="mt-4" />
  </div>
);
}
