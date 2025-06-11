import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Major League</h1>
      <div className="flex gap-4">
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/dashboard">Dashboard (auth user)</Link>
        <Link href="/create">Create Entities (admin)</Link>
      </div>
    </div>
  );
}
