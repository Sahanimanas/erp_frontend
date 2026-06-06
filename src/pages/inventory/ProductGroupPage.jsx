/**
 * ProductGroupPage.jsx
 * Module : inventory
 * Page   : Product Groups
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader } from "../../components/ui";

const initialGroups = [
  { id: 1, name: "Class 7", remarks: "Class 7 book set" },
  { id: 2, name: "Class 8", remarks: "class 8 books set" },
  { id: 3, name: "Class 6", remarks: "class 6 books set" },
  { id: 4, name: "Class 5", remarks: "class 5 books set" },
  { id: 5, name: "class 4", remarks: "class 4 books set" },
  { id: 6, name: "Class3",  remarks: "class 3 books set" },
  { id: 7, name: "Class2",  remarks: "class 2 books set" },
  { id: 8, name: "Class 1", remarks: "Total 1 Books" },
];

export default function ProductGroupPage() {
  usePageTitle("Product Groups");

  const [groups, setGroups] = useState(initialGroups);
  const [form, setForm] = useState({ productGroup: "", product: "", remarks: "" });
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.productGroup.trim() || !form.product.trim()) return;

    if (editingId !== null) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingId
            ? { ...g, name: form.productGroup, remarks: form.remarks }
            : g
        )
      );
      setEditingId(null);
    } else {
      const newGroup = {
        id: groups.length ? Math.max(...groups.map((g) => g.id)) + 1 : 1,
        name: form.productGroup,
        remarks: form.remarks,
      };
      setGroups((prev) => [...prev, newGroup]);
    }

    setForm({ productGroup: "", product: "", remarks: "" });
  };

  const handleEdit = (group) => {
    setEditingId(group.id);
    setForm({ productGroup: group.name, product: "", remarks: group.remarks });
  };

  const handleDelete = (id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ productGroup: "", product: "", remarks: "" });
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", background: "#f5f6fa", minHeight: "100vh" }}>
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <span style={{
          background: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "6px",
          padding: "6px 10px",
          fontSize: "20px",
        }}>🏠</span>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#222" }}>Inventory</h2>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* LEFT — Add Form */}
        <div style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "24px",
          minWidth: "300px",
          width: "35%",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <span style={{ fontSize: "16px" }}>✏️</span>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#333" }}>
              {editingId !== null ? "Edit Product Group" : "Add Product Group"}
            </h3>
          </div>

          <label style={labelStyle}>
            Product Group <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="productGroup"
            value={form.productGroup}
            onChange={handleChange}
            style={inputStyle}
            placeholder=""
          />

          <label style={labelStyle}>
            Product <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="product"
            value={form.product}
            onChange={handleChange}
            style={inputStyle}
            placeholder=""
          />

          <label style={labelStyle}>Remarks</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={4}
            style={{ ...inputStyle, resize: "vertical", height: "80px" }}
          />

          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <button onClick={handleSave} style={saveButtonStyle}>
              ＋ Save
            </button>
          </div>
        </div>

        {/* RIGHT — Table */}
        <div style={{
          background: "#fff",
          borderRadius: "10px",
          flex: 1,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ fontSize: "16px" }}>☰</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#333" }}>
              Product Group — List
            </h3>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "#f8f9fb" }}>
                {[
                  "SL",
                  "NAME",
                  "REMARKS",
                  "ACTION",
                ].map((col) => (
                  <th key={col} style={thStyle}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#aaa" }}>
                    No product groups yet.
                  </td>
                </tr>
              ) : (
                groups.map((group, index) => (
                  <tr
                    key={group.id}
                    style={{
                      background: editingId === group.id ? "#eef3ff" : index % 2 === 0 ? "#fff" : "#fafafa",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>{group.name}</td>
                    <td style={tdStyle}>{group.remarks}</td>
                    <td style={{ ...tdStyle, display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleEdit(group)}
                        style={editBtnStyle}
                        title="Edit"
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        style={deleteBtnStyle}
                        title="Delete"
                      >🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "#444",
  marginBottom: "5px",
  marginTop: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #dde1e7",
  borderRadius: "6px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  color: "#333",
  background: "#fff",
};

const saveButtonStyle = {
  background: "#4f5bd5",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "8px 20px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const thStyle = {
  padding: "11px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#888",
  letterSpacing: "0.04em",
  borderBottom: "1px solid #eee",
};

const tdStyle = {
  padding: "11px 16px",
  color: "#333",
  fontSize: "14px",
  verticalAlign: "middle",
};

const editBtnStyle = {
  background: "#6c757d",
  border: "none",
  borderRadius: "5px",
  padding: "5px 9px",
  cursor: "pointer",
  fontSize: "13px",
};

const deleteBtnStyle = {
  background: "#dc3545",
  border: "none",
  borderRadius: "5px",
  padding: "5px 9px",
  cursor: "pointer",
  fontSize: "13px",
};
