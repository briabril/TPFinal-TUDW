"use client";
import { useState, useEffect } from "react";

export default function EditProfilePage() {
  const userId = "2fdf1541-7060-492a-bacf-9846c5f1731a";

  const [form, setForm] = useState({
    username: "",
    displayname: "",
    bio: "",
    profile_picture_url: ""
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/api/users/${userId}`);
      if (res.ok) {
        const user = await res.json();
        setForm({
          username: user.username || "",
          displayname: user.displayname || "",
          bio: user.bio || "",
          profile_picture_url: user.profile_picture_url || ""
        });
      }
      setLoading(false);
    }
    fetchUser();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess("¡Perfil actualizado correctamente!");
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar el perfil.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <span className="text-white text-lg">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Perfil</h2>
        {success && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded text-center">
            {error}
          </div>
        )}
        <label className="text-white font-semibold" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="border rounded px-3 py-2"
        />
        <label className="text-white font-semibold" htmlFor="displayname">
          Display Name
        </label>
        <input
          id="displayname"
          name="displayname"
          value={form.displayname}
          onChange={handleChange}
          placeholder="Display Name"
          className="border rounded px-3 py-2"
        />
        <label className="text-white font-semibold" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Bio"
          className="border rounded px-3 py-2 resize-none"
        />
        <label className="text-white font-semibold" htmlFor="profile_picture_url">
          Profile Picture URL
        </label>
        <input
          id="profile_picture_url"
          name="profile_picture_url"
          value={form.profile_picture_url}
          onChange={handleChange}
          placeholder="Profile Picture URL"
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 rounded px-4 py-2 hover:bg-blue-700 transition text-white"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}