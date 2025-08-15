import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useauthStore";
import { toast } from "react-hot-toast";

export default function ProfileAdmin() {
  const { 
    authUser, 
    admins = [], 
    updateProfile, 
    addAdmin, 
    fetchAdmins, 
    deleteAdmin,
    loading,
    checkAuth
  } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  if (authUser) {
    fetchAdmins().catch(error => {
      toast.error("Failed to load admins: " + error.message);
    });
    if (!authUser.isAdmin) {
        setIsEditing(true)
  }
}
  
  // Only include stable dependencies
}, [authUser]); // Remove checkAuth and fetchAdmins from dependencies

  useEffect(() => {
    if (authUser && isEditing && currentAdminId === authUser.id) {
      setFormData({
        username: authUser.username || "",
        email: authUser.email || "",
        password: "",
        isAdmin: authUser.isAdmin || false
      });
    }
  }, [authUser, isEditing, currentAdminId]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (!/^[A-Za-z][A-Za-z0-9\-]{2,29}$/.test(formData.username)) {
      errors.username = "Must be 3-30 chars (letters, numbers, dash)";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!isEditing && !formData.password) {
      errors.password = "Password is required";
    } else if (!isEditing && !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(formData.password)) {
      errors.password = "Must be 8+ chars with number, lowercase & uppercase";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  try {
    if (isEditing) {
      // Allow editing if:
      // 1. User is editing their own profile OR
      // 2. User is an admin editing someone else's profile
      if (!authUser.isAdmin && currentAdminId !== authUser.id) {
        throw new Error("You can only edit your own profile");
      }
      
      await updateProfile({
        ...formData,
        id: currentAdminId,
        // Only allow admin status change if current user is admin
        isAdmin: authUser.isAdmin ? formData.isAdmin : authUser.isAdmin
      });
      toast.success("Profile updated successfully");
    } else {
      // Only admins can add new admins
      if (!authUser.isAdmin) {
        throw new Error("Only admins can add new admins");
      }
      await addAdmin(formData);
      toast.success("New admin added successfully");
      resetForm();
    }
    await fetchAdmins();
  } catch (error) {
    toast.error(error.message || "Operation failed");
  }
};

const handleSubmit2= async (e) => {
  e.preventDefault();
  
    if (!validateForm()) {
        console.error("Validation failed", validationErrors);
        toast.error("Please fix validation errors");
        return;
    }
    ;
    try {
        updateProfile({
        ...formData,
         id: authUser.id
        });
        toast.success("Profile updated successfully");
    } catch (error) {
        toast.error(error.message || "Update failed");
    }
};

  const handleEdit = (admin) => {
    if (!authUser.isAdmin && admin.id !== authUser.id) {
      toast.error("You can only edit your own profile");
      return;
    }

    setFormData({
      username: admin.username,
      email: admin.email,
      password: "",
      isAdmin: admin.isAdmin
    });
    setCurrentAdminId(admin.id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!authUser.isAdmin) {
      toast.error("Only admins can delete users");
      return;
    }

    if (id === authUser.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await deleteAdmin(id);
        toast.success("Admin deleted successfully");
        await fetchAdmins();
      } catch (error) {
        toast.error(error.message || "Failed to delete admin");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      isAdmin: false
    });
    setCurrentAdminId(null);
    setIsEditing(false);
    setValidationErrors({});
  };


  if (!authUser) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          You need to be logged in to view this page
        </div>
      </div>
    );
  }

  // Non-admin view
  if (!authUser.isAdmin) {
    return (
      <div className="p-6">
        <div className="card bg-base-100 shadow max-w-xl mx-auto container">
          <div className="card-body  mx-auto ">
            <h2 className="card-title text-2xl text-center">My Profile</h2>
            <form onSubmit={handleSubmit2} >
              <div className="form-control flex flex-col gap-2">
                <label className="label">
                  <span className="label-text">Username</span>  
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input input-bordered ${validationErrors.username ? 'input-error' : ''}`}
                  disabled={loading}
                  placeholder="Username"
                  required
                />
                {validationErrors.username && (
                  <span className="text-error text-sm mt-1">
                    {validationErrors.username}
                  </span>
                )}
              </div>

              <div className="form-control flex flex-col gap-2 mt-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input input-bordered ${validationErrors.email ? 'input-error' : ''}`}
                  disabled={loading}
                    placeholder="Email"
                  required
                />
                {validationErrors.email && (
                  <span className="text-error text-sm mt-1">
                    {validationErrors.email}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Management</h2>
        <button 
          className="btn btn-primary"
          onClick={resetForm}
          disabled={loading}
        >
          {isEditing ? "Cancel Edit" : "Add New Admin"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">
              {isEditing ? "Edit Admin" : "Add New Admin"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input input-bordered ${validationErrors.username ? 'input-error' : ''}`}
                  disabled={loading}
                    placeholder="Username"
                  required
                />
                {validationErrors.username && (
                  <span className="text-error text-sm mt-1">
                    {validationErrors.username}
                  </span>
                )}
              </div>

              <div className="form-control">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input input-bordered ${validationErrors.email ? 'input-error' : ''}`}
                  disabled={loading}
                    placeholder="Email"
                  required
                />
                {validationErrors.email && (
                  <span className="text-error text-sm mt-1">
                    {validationErrors.email}
                  </span>
                )}
              </div>

              {!isEditing && (
                <div className="form-control">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input input-bordered ${validationErrors.password ? 'input-error' : ''}`}
                    disabled={loading}
                    required
                    placeholder="Password"
                  />
                  {validationErrors.password && (
                    <span className="text-error text-sm mt-1">
                      {validationErrors.password}
                    </span>
                  )}
                </div>
              )}

              <div className="form-control mt-4">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleChange}
                    className="checkbox checkbox-primary"
                    disabled={loading || (!isEditing && !authUser.isAdmin)}
                  />
                  <span className="label-text">Admin Privileges</span>
                </label>
              </div>

              <div className="mt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : isEditing ? (
                    "Update Admin"
                  ) : (
                    "Add Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Admins List */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Existing Admins</h3>
            {admins.length === 0 ? (
              <div className="text-center py-4">
                <p>No admins found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Admin</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.username}</td>
                        <td>{admin.email}</td>
                        <td>
                          {admin.isAdmin ? (
                            <span className="badge badge-success">Yes</span>
                          ) : (
                            <span className="badge badge-warning">No</span>
                          )}
                        </td>
                        <td className="flex gap-2">
                          {(authUser.isAdmin || admin.id === authUser.id) && (
                            <button
                              onClick={() => handleEdit(admin)}
                              className="btn btn-sm btn-outline"
                              disabled={loading}
                            >
                              Edit
                            </button>
                          )}
                          {authUser.isAdmin && admin.id !== authUser.id && (
                            <button 
                              onClick={() => handleDelete(admin.id)}
                              className="btn btn-sm btn-error"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}