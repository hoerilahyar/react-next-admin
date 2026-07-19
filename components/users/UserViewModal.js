"use client";

export default function UserViewModal({
  user,
  loading,
  error,
  onClose,
}) {
  const profile = user?.profile;
  return (
    <>
      <div className="modal show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">User Detail</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {user && (
                <div className="card">
                  <div className="card-body p-0">
                    <div className="user-profile-img">
                      <img src="assets/images/pattern-bg.jpg" className="profile-img profile-foreground-img rounded-top" style={{ height: "120px" }} alt="" />
                      <div className="overlay-content rounded-top">
                        <div>
                          <div className="user-nav p-3">
                            <div className="d-flex justify-content-end">
                              <div className="dropdown">
                                <a className="text-muted dropdown-toggle font-size-16" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true">
                                  <i className="bx bx-dots-vertical text-white font-size-20"></i>
                                </a>
                                <div className="dropdown-menu dropdown-menu-end">
                                  <a className="dropdown-item" href="#">Edit</a>
                                  <a className="dropdown-item" href="#">Action</a>
                                  <a className="dropdown-item" href="#">Remove</a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="mt-n5 position-relative text-center border-bottom pb-3">
                        <img
                          src={profile?.avatar_url || "assets/images/users/avatar-3.jpg"}
                          alt=""
                          className="avatar-xl rounded-circle img-thumbnail"
                        />
                        <div className="mt-3">
                          <h5 className="mb-1">{user.name}</h5>
                          <p className="text-muted mb-0">@{user.username}</p>
                        </div>
                      </div>

                      <div className="table-responsive mt-3 border-bottom pb-3">
                        <table className="table align-middle table-sm table-nowrap table-borderless table-centered mb-0">
                          <tbody>
                            <tr>
                              <th className="fw-bold">Email :</th>
                              <td className="text-muted">{user.email}</td>
                            </tr>
                            <tr>
                              <th className="fw-bold">Status :</th>
                              <td className="text-muted">{user.is_active ? "Active" : "Inactive"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="table-responsive mt-3 pb-1">
                        {loading && (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        )}

                        {!loading && error && (
                          <div className="alert alert-danger mb-0">{error}</div>
                        )}

                        {!loading && !error && profile && (
                          <table className="table align-middle table-sm table-nowrap table-borderless table-centered mb-0">
                            <tbody>
                              <tr>
                                <th className="fw-bold">Phone :</th>
                                <td className="text-muted">{profile.phone || "-"}</td>
                              </tr>
                              <tr>
                                <th className="fw-bold">Address :</th>
                                <td className="text-muted">{profile.address || "-"}</td>
                              </tr>
                              <tr>
                                <th className="fw-bold">City :</th>
                                <td className="text-muted">{profile.city || "-"}</td>
                              </tr>
                              <tr>
                                <th className="fw-bold">Country :</th>
                                <td className="text-muted">{profile.country || "-"}</td>
                              </tr>
                              <tr>
                                <th className="fw-bold">Postal Code :</th>
                                <td className="text-muted">{profile.postal_code || "-"}</td>
                              </tr>
                              <tr>
                                <th className="fw-bold">Gender :</th>
                                <td className="text-muted">{profile.gender || "-"}</td>
                              </tr>
                              <tr>
                                <th className="fw-bold">Date of Birth :</th>
                                <td className="text-muted">{profile.date_of_birth || "-"}</td>
                              </tr>
                              <tr>
                                <th className="fw-bold">Website :</th>
                                <td className="text-muted">{profile.website || "-"}</td>
                              </tr>
                              {profile.bio && (
                                <tr>
                                  <th className="fw-bold">Bio :</th>
                                  <td className="text-muted">{profile.bio}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary w-auto" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}