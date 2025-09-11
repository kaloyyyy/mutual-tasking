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
  profiles?: Profile;
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
      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", projectSlug)
        .single();

      if (project) {
        setProjectId(project.id);

        // fetch project members and their profiles
        const { data: membersData, error: membersError } = await supabase
          .from("project_members")
          .select("user_id, profiles!project_members_user_id_fkey(id, username, email)")
          .eq("project_id", project.id);

        if (membersError) {
          console.error("Error fetching project members:", membersError.message);
          return;
        }

        setMembers(
          (membersData || []).map((m) => ({
            user_id: m.user_id,
            profiles: m.profiles?.[0], // or adjust depending on your Supabase join
          }))
        );

      }
    };

    fetchData();
  }, [projectSlug]);

  const handleSubmit = async () => {
    if (!projectId) {
      alert("Project not found");
      return;
    }

    // check existing slugs to generate unique one
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

    // insert assignees into task_assignees
    if (task && assignees.length > 0) {
      const { error: assignError } = await supabase.from("task_assignees").insert(
        assignees.map((userId) => ({
          task_id: task.id,
          user_id: userId,
        }))
      );

      if (assignError) {
        alert(assignError.message);
      }
    }

    router.push(`/dashboard/${projectSlug}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Task</h2>
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
        value={dueDate}
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
            {m.profiles?.username || m.profiles?.email}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded w-full"
        disabled={!projectId}
      >
        Create Task
      </button>
    </div>
  );
}
