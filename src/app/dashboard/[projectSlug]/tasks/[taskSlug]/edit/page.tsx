"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { generateUniqueSlug } from "@/lib/lib";
interface Profile {
  username: string;
  email: string;
}

interface Member {
  user_id: string;
  profiles?: Profile[]; // array
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

  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignees, setAssignees] = useState<string[]>([]);


  // fetch task + project members
  useEffect(() => {
    const fetchData = async () => {
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (!project) return;

      // fetch task
      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("slug", taskSlug)
        .eq("project_id", project.id)
        .single();

      if (task) {
        setTask(task);
        setTitle(task.title);
        setDescription(task.description || "");
        setDueDate(task.due_date || "");
        setPriority(task.priority || "medium");
      }

      // fetch members
      const { data: members } = await supabase
        .from("project_members")
        .select("user_id, profiles(username, email)")
        .eq("project_id", project.id);

      setMembers(members || []);

      // fetch task assignees
      const { data: taskAssignees } = await supabase
        .from("task_assignees")
        .select("user_id")
        .eq("task_id", task.id);

      setAssignees(taskAssignees?.map((a) => a.user_id) || []);
    };

    fetchData();
  }, [projectSlug, taskSlug]);

  const handleUpdate = async () => {
    if (!task) return;

    // check slug uniqueness if title changed
    let slug = task.slug;
    if (title !== task.title) {
      const { data: existingTasks } = await supabase
        .from("tasks")
        .select("slug")
        .eq("project_id", task.project_id);

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

    if (error) {
      alert(error.message);
      return;
    }

    // reset task assignees
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

  if (!task) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Task</h2>

      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="date"
        value={dueDate || ""}
        onChange={(e) => setDueDate(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>

      <label className="block mb-2 font-medium">Assign to:</label>
      <select
        multiple
        value={assignees}
        onChange={(e) =>
          setAssignees(Array.from(e.target.selectedOptions, (o) => o.value))
        }
        className="border p-2 w-full mb-4 rounded"
      >
        {members.map((m) => (
          <option key={m.user_id} value={m.user_id}>
            {m.profiles?.[0]?.username || m.profiles?.[0]?.email}
          </option>
        ))}
      </select>

      <button
        onClick={handleUpdate}
        className="bg-green-500 text-white p-2 rounded w-full"
      >
        Save Changes
      </button>
    </div>
  );
}
