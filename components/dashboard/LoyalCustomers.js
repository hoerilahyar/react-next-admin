"use client";

const customers = [
  { img: "/assets/images/users/avatar-4.jpg", name: "Michelle Bernard", email: "Michelle@gmail.com", rating: "4.7" },
  { img: "/assets/images/users/avatar-5.jpg", name: "David Grajeda", email: "David@gmail.com", rating: "3.4" },
  { img: "/assets/images/users/avatar-6.jpg", name: "Charles Roman", email: "Charles@gmail.com", rating: "4.9" },
  { img: "/assets/images/users/avatar-7.jpg", name: "David Reynolds", email: "David@gmail.com", rating: "3.5" },
  { img: "/assets/images/users/avatar-8.jpg", name: "Marion Munroe", email: "Marion@gmail.com", rating: "2.3" },
  { img: "/assets/images/users/avatar-5.jpg", name: "Christina Emerson", email: "Christina@gmail.com", rating: "4.1" },
];

export default function LoyalCustomers() {
  return (
    <div className="col-xl-5">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-start mb-2">
            <div className="flex-grow-1">
              <h5 className="card-title">Loyal Customers</h5>
            </div>
            <div className="flex-shrink-0">
              <div className="dropdown">
                <a
                  className="dropdown-toggle text-muted"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="bx bx-dots-horizontal font-size-22"></i>
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" href="#">Yearly</a>
                  <a className="dropdown-item" href="#">Monthly</a>
                  <a className="dropdown-item" href="#">Weekly</a>
                  <a className="dropdown-item" href="#">Today</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-n4" data-simplebar style={{ maxHeight: "421px" }}>
            {customers.map((c, i) => (
              <div className={`${i < customers.length - 1 ? "border-bottom" : ""} loyal-customers-box ${i === 0 ? "pt-2" : "py-3"}`} key={`${c.name}-${i}`}>
                <div className="d-flex align-items-center">
                  <img src={c.img} className="rounded-circle avatar img-thumbnail" alt="" />
                  <div className="flex-grow-1 ms-3 overflow-hidden">
                    <h5 className="font-size-15 mb-1 text-truncate">{c.name}</h5>
                    <p className="text-muted text-truncate mb-0">{c.email}</p>
                  </div>
                  <div className="flex-shrink-0 text-end">
                    <h5 className="font-size-14 mb-0 text-truncate w-xs bg-light p-2 rounded text-center">
                      {c.rating} <i className="bx bxs-star font-size-14 text-primary ms-1"></i>
                    </h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
