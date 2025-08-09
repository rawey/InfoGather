import React, { useEffect, useState } from "react";

type Visitor = {
  id: string;
  name: string;
  date: string; // or Date, depending on your data
};

export default function DatosVisitantes() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Fetch visitors from Netlify function
  const fetchVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/.netlify/functions/visitors");
      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);
      const data: Visitor[] = await res.json();
      setVisitors(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Add a visitor, then refresh list
  const addVisitor = async () => {
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/.netlify/functions/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          date: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Add failed: ${res.statusText}`);
      await fetchVisitors();
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Visitors List</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      <button onClick={addVisitor} disabled={adding} style={{ marginBottom: "1rem" }}>
        {adding ? "Adding..." : "Add Visitor"}
      </button>

      {loading ? (
        <div>Loading visitors...</div>
      ) : visitors.length === 0 ? (
        <div>No visitors found.</div>
      ) : (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            maxWidth: "600px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}
              >
                Name
              </th>
              <th
                style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v.id}>
                <td
                  style={{ border: "1px solid #ccc", padding: "0.5rem" }}
                >
                  {v.name}
                </td>
                <td
                  style={{ border: "1px solid #ccc", padding: "0.5rem" }}
                >
                  {new Date(v.date).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
