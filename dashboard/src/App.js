import {Component} from "react";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/users";

class App extends Component {
  state = {
      users: [],
      filteredUsers: [],
      form: { id: null, name: "", email: "", department: "" },
      isEditing: false,
      error: "",
      search: "",
      perPage: 10,
      currentPage: 1,
    
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      this.setState({ users: data, filteredUsers: data });
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { form, users, isEditing } = this.state;
    if (!form.name || !form.email || !form.department) {
      this.setState({ error: "All fields are required" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}${isEditing ? `/${form.id}` : ""}`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save user");
      const data = await res.json();
      let updatedUsers = isEditing
        ? users.map((u) => (u.id === form.id ? data : u))
        : [...users, { ...data, id: users.length + 1 }];
      this.setState({ users: updatedUsers, filteredUsers: updatedUsers });
      this.resetForm();
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      const updated = this.state.users.filter((u) => u.id !== id);
      this.setState({ users: updated, filteredUsers: updated });
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  handleEdit = (user) => {
    this.setState({ form: user, isEditing: true });
  };

  resetForm = () => {
    this.setState({ form: { id: null, name: "", email: "", department: "" }, isEditing: false, error: "" });
  };

  handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = this.state.users.filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
    this.setState({ search: e.target.value, filteredUsers: filtered });
  };

  render() {
    const { filteredUsers, form, isEditing, error, search, perPage, currentPage } = this.state;
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage);
    const totalPages = Math.ceil(filteredUsers.length / perPage);

    return (
      <div className="container">
        <h1>User Management</h1>
        {error && <p className="error">{error}</p>}

        <div className="controls">
          <input type="text" placeholder="Search..." value={search} onChange={this.handleSearch} />
          <select value={perPage} onChange={(e) => this.setState({ perPage: Number(e.target.value) })}>
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <form onSubmit={this.handleSubmit} className="user-form">
          <input type="text" placeholder="Name" value={form.name} onChange={(e) => this.setState({ form: { ...form, name: e.target.value } })} />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => this.setState({ form: { ...form, email: e.target.value } })} />
          <input type="text" placeholder="Department" value={form.department} onChange={(e) => this.setState({ form: { ...form, department: e.target.value } })} />
          <button type="submit">{isEditing ? "Update" : "Add"} User</button>
          {isEditing && <button type="button" onClick={this.resetForm}>Cancel</button>}
        </form>

        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.department || "N/A"}</td>
                <td>
                  <button onClick={() => this.handleEdit(user)}>Edit</button>
                  <button onClick={() => this.handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => this.setState({ currentPage: i + 1 })} className={currentPage === i + 1 ? "active" : ""}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
