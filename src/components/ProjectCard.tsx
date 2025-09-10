import Link from "next/link";

export default function ProjectCard({ project }: { project: any }) {
  return (
    <Link
      href={`/dashboard/${project.slug}`}
      className="p-4 bg-gray-800 shadow hover:shadow-lg rounded-md transition"
    >
      <h3 className="font-bold text-lg text-gray-100">{project.name}</h3>
      <p className="text-gray-300">{project.description}</p>
    </Link>
  );
}