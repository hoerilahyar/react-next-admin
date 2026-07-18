"use client";

import { useAuth } from "@/lib/auth-context";
import { toggleSidebar } from "@/lib/sidebar-toggle";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header id="page-topbar" className="isvertical-topbar">
            <div className="navbar-header">
                <div className="d-flex">

                    <div className="navbar-brand-box">
                        <a href="/dashboard" className="logo logo-dark">
                            <span className="logo-sm">
                                <img src="/assets/images/logo-dark-sm.png" alt="" height="26" />
                            </span>
                            <span className="logo-lg">
                                <img src="/assets/images/logo-dark-sm.png" alt="" height="26" />
                            </span>
                        </a>

                        <a href="/dashboard" className="logo logo-light">
                            <span className="logo-lg">
                                <img src="/assets/images/logo-light.png" alt="" height="30" />
                            </span>
                            <span className="logo-sm">
                                <img src="/assets/images/logo-light-sm.png" alt="" height="26" />
                            </span>
                        </a>
                    </div>

                    <button type="button" className="btn btn-sm px-3 font-size-24 header-item waves-effect vertical-menu-btn" onClick={toggleSidebar}>
                        <i className="bx bx-menu align-middle"></i>
                    </button>


                    <div className="page-title-box align-self-center d-none d-md-block">
                        <h4 className="page-title mb-0">Hi, Welcome Back!</h4>
                    </div>


                </div>

                <div className="d-flex">

                    <div className="dropdown d-inline-block language-switch ms-2">
                        <button type="button" className="btn header-item" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img className="header-lang-img" src="/assets/images/flags/us.jpg" alt="Header Language" height="18" />
                        </button>
                        <div className="dropdown-menu dropdown-menu-end">


                            <a href="#;" className="dropdown-item notify-item language" data-lang="eng">
                                <img src="/assets/images/flags/us.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">English</span>
                            </a>


                            <a href="#;" className="dropdown-item notify-item language" data-lang="sp">
                                <img src="/assets/images/flags/spain.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">Spanish</span>
                            </a>


                            <a href="#;" className="dropdown-item notify-item language" data-lang="gr">
                                <img src="/assets/images/flags/germany.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">German</span>
                            </a>


                            <a href="#;" className="dropdown-item notify-item language" data-lang="it">
                                <img src="/assets/images/flags/italy.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">Italian</span>
                            </a>


                            <a href="#;" className="dropdown-item notify-item language" data-lang="ru">
                                <img src="/assets/images/flags/russia.jpg" alt="user-image" className="me-1" height="12" /> <span className="align-middle">Russian</span>
                            </a>
                        </div>
                    </div>

                    <div className="dropdown d-inline-block">
                        <button type="button" className="btn header-item noti-icon"
                            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="bx bx-search icon-sm align-middle"></i>
                        </button>
                        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
                            <form className="p-2">
                                <div className="search-box">
                                    <div className="position-relative">
                                        <input type="text" className="form-control rounded bg-light border-0" placeholder="Search..." />
                                        <i className="bx bx-search search-icon"></i>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="dropdown d-inline-block">
                        <button type="button" className="btn header-item noti-icon" id="page-header-notifications-dropdown-v"
                            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="bx bx-bell icon-sm align-middle"></i>
                            <span className="noti-dot bg-danger rounded-pill">4</span>
                        </button>
                        <div className="dropdown-menu dropdown-menu-xl dropdown-menu-end p-0"
                            aria-labelledby="page-header-notifications-dropdown-v">
                            <div className="p-3">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <h5 className="m-0 font-size-15"> Notifications </h5>
                                    </div>
                                    <div className="col-auto">
                                        <a href="#" className="small fw-semibold text-decoration-underline"> Mark all as read</a>
                                    </div>
                                </div>
                            </div>
                            <div data-simplebar style={{ maxHeight: '250px' }}>
                                <a href="#" className="text-reset notification-item">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0 me-3">
                                            <img src="/assets/images/users/avatar-3.jpg" className="rounded-circle avatar-sm" alt="user-pic" />
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="text-muted font-size-13 mb-0 float-end">1 hour ago</p>
                                            <h6 className="mb-1">James Lemire</h6>
                                            <div>
                                                <p className="mb-0">It will seem like simplified English.</p>
                                            </div>
                                        </div>

                                    </div>
                                </a>
                                <a href="#" className="text-reset notification-item">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0 avatar-sm me-3">
                                            <span className="avatar-title bg-primary rounded-circle font-size-18">
                                                <i className="bx bx-cart"></i>
                                            </span>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="text-muted font-size-13 mb-0 float-end">3 min ago</p>
                                            <h6 className="mb-1">Your order is placed</h6>
                                            <div>
                                                <p className="mb-0">If several languages coalesce the grammar</p>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                                <a href="#" className="text-reset notification-item">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0 avatar-sm me-3">
                                            <span className="avatar-title bg-success rounded-circle font-size-18">
                                                <i className="bx bx-badge-check"></i>
                                            </span>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="text-muted font-size-13 mb-0 float-end">8 min ago</p>
                                            <h6 className="mb-1">Your item is shipped</h6>
                                            <div>
                                                <p className="mb-0">If several languages coalesce the grammar</p>
                                            </div>
                                        </div>
                                    </div>
                                </a>

                                <a href="#" className="text-reset notification-item">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0 me-3">
                                            <img src="/assets/images/users/avatar-6.jpg" className="rounded-circle avatar-sm" alt="user-pic" />
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="text-muted font-size-13 mb-0 float-end">1 hour ago</p>
                                            <h6 className="mb-1">Salena Layfield</h6>
                                            <div>
                                                <p className="mb-1">As a skeptical Cambridge friend of mine occidental.</p>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <div className="p-2 border-top d-grid">
                                <a className="btn btn-sm btn-link font-size-14 btn-block text-center" href="#">
                                    <i className="uil-arrow-circle-right me-1"></i> <span>View More..</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="dropdown d-inline-block">
                        <button type="button" className="btn header-item user text-start d-flex align-items-center" id="page-header-user-dropdown-v"
                            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img className="rounded-circle header-profile-user" src="/assets/images/users/avatar-3.jpg"
                                alt="Header Avatar" />
                            <span className="d-none d-xl-inline-block ms-2 fw-medium font-size-15">{user?.name ?? "User"}</span>
                        </button>
                        <div className="dropdown-menu dropdown-menu-end pt-0">
                            <div className="p-3 border-bottom">
                                <h6 className="mb-0">{user?.name ?? "User"}</h6>
                                <p className="mb-0 font-size-11 text-muted">{user?.email ?? ""}</p>
                            </div>
                            <a className="dropdown-item" href="#"><i className="mdi mdi-account-circle text-muted font-size-16 align-middle me-2"></i> <span className="align-middle">Profile</span></a>
                            <a className="dropdown-item" href="#"><i className="mdi mdi-message-text-outline text-muted font-size-16 align-middle me-2"></i> <span className="align-middle">Messages</span></a>
                            <a className="dropdown-item" href="#"><i className="mdi mdi-lifebuoy text-muted font-size-16 align-middle me-2"></i> <span className="align-middle">Help</span></a>
                            <a className="dropdown-item d-flex align-items-center" href="#"><i className="mdi mdi-cog-outline text-muted font-size-16 align-middle me-2"></i> <span className="align-middle me-3">Settings</span><span className="badge bg-success-subtle text-success  ms-auto">New</span></a>
                            <a className="dropdown-item" href="#"><i className="mdi mdi-lock text-muted font-size-16 align-middle me-2"></i> <span className="align-middle">Lock screen</span></a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="#" onClick={logout}><i className="mdi mdi-logout text-muted font-size-16 align-middle me-2"></i> <span className="align-middle">Logout</span></a>
                        </div>
                    </div>
                </div>
            </div>
        </header>

    );
}
