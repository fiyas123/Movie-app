import React, { useState, useEffect, useRef } from "react";

export default function App() {
  // ---------- AUTH STATE ----------
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });

  // ---------- MOVIE DATA STATE ----------
  const [entries, setEntries] = useState(
    JSON.parse(localStorage.getItem("entries")) || []
  );
  const [form, setForm] = useState({
    id: null,
    title: "",
    type: "Movie",
    director: "",
    budget: "",
    location: "",
    duration: "",
    year: "",
    image: "",
  });
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const loadMoreRef = useRef(null);

  // ---------- EFFECTS ----------
  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + 5);
      }
    });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  // ---------- AUTH FUNCTIONS ----------
  const handleAuth = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (authMode === "signup") {
      if (users.find((u) => u.username === authForm.username)) {
        alert("User already exists!");
        return;
      }
      users.push(authForm);
      localStorage.setItem("users", JSON.stringify(users));
      alert("Signup successful! Please login.");
      setAuthMode("login");
    } else {
      const userFound = users.find(
        (u) =>
          u.username === authForm.username && u.password === authForm.password
      );
      if (userFound) {
        setUser(authForm.username);
        localStorage.setItem("user", authForm.username);
      } else {
        alert("Invalid credentials!");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser("");
  };

  // ---------- CRUD FUNCTIONS ----------
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Title is required!");
    if (form.id) {
      setEntries((prev) =>
        prev.map((item) => (item.id === form.id ? { ...form } : item))
      );
    } else {
      setEntries((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setForm({
      id: null,
      title: "",
      type: "Movie",
      director: "",
      budget: "",
      location: "",
      duration: "",
      year: "",
      image: "",
    });
  };

  const handleEdit = (entry) => setForm(entry);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setEntries((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // ---------- FILTERED DATA ----------
  const filteredEntries = entries.filter((entry) =>
    entry.title.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- AUTH PAGE ----------
  if (!user)
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">
          {authMode === "login" ? "Login" : "Sign Up"}
        </h1>
        <form
          onSubmit={handleAuth}
          className="bg-gray-900 p-6 rounded-lg shadow-md flex flex-col gap-4 w-80"
        >
          <input
            type="text"
            placeholder="Username"
            className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
            value={authForm.username}
            onChange={(e) =>
              setAuthForm({ ...authForm, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-gray-800 border border-gray-700 text-white"
            value={authForm.password}
            onChange={(e) =>
              setAuthForm({ ...authForm, password: e.target.value })
            }
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            {authMode === "login" ? "Login" : "Sign Up"}
          </button>
          <p
            className="text-sm text-center text-gray-400 cursor-pointer hover:text-red-400"
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
          >
            {authMode === "login"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </p>
        </form>
      </div>
    );

  // ---------- MAIN PAGE ----------
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎬 Favorite Movies & TV Shows</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
        >
          Logout
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search by Title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-gray-900 border border-gray-700 text-white"
      />

      {/* Add/Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-900 p-4 rounded mb-6"
      >
        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="p-2 rounded bg-black border border-gray-700 text-white"
        />

        {/* Type - SELECT BOX */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-2 rounded bg-black border border-gray-700 text-white"
        >
          <option value="Movie">Movie</option>
          <option value="TV Show">TV Show</option>
        </select>

        {/* Remaining Fields */}
        {["director", "budget", "location", "duration", "year", "image"].map(
          (field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={handleChange}
              className="p-2 rounded bg-black border border-gray-700 text-white"
            />
          )
        )}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white py-2 rounded col-span-2 md:col-span-4"
        >
          {form.id ? "Update Entry" : "Add Entry"}
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700">
          <thead className="bg-gray-900">
            <tr>
              {[
                "Poster",
                "Title",
                "Type",
                "Director",
                "Budget",
                "Location",
                "Duration",
                "Year",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  className="border border-gray-700 px-3 py-2 text-left font-semibold"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEntries.slice(0, visibleCount).map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-800">
                <td className="border border-gray-700 px-3 py-2">
                  {entry.image ? (
                    <img
                      src={entry.image}
                      alt={entry.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="border border-gray-700 px-3 py-2">{entry.title}</td>
                <td className="border border-gray-700 px-3 py-2">{entry.type}</td>
                <td className="border border-gray-700 px-3 py-2">{entry.director}</td>
                <td className="border border-gray-700 px-3 py-2">{entry.budget}</td>
                <td className="border border-gray-700 px-3 py-2">{entry.location}</td>
                <td className="border border-gray-700 px-3 py-2">{entry.duration}</td>
                <td className="border border-gray-700 px-3 py-2">{entry.year}</td>
                <td className="border border-gray-700 px-3 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={loadMoreRef} className="h-10"></div>
      </div>
    </div>
  );
}
