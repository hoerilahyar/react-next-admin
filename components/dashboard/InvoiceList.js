"use client";

const invoices = [
  { id: "#562354", name: "Neal Matthews", avatar: "/assets/images/users/avatar-1.jpg", date: "10 Dec", status: "Paid" },
  { id: "#485625", name: "Connie Franco", avatar: "/assets/images/users/avatar-2.jpg", date: "10 Dec", status: "Paid" },
  { id: "#321458", name: "Adella Perez", avatar: "/assets/images/users/avatar-3.jpg", date: "12 Dec", status: "Unpaid" },
  { id: "#214569", name: "Theresa Mayers", avatar: "/assets/images/users/avatar-4.jpg", date: "21 Dec", status: "Paid" },
  { id: "#565423", name: "Oliver Gonzales", avatar: "/assets/images/users/avatar-5.jpg", date: "25 Dec", status: "Unpaid" },
  { id: "#565423", name: "Willie Verner", avatar: "/assets/images/users/avatar-6.jpg", date: "30 Dec", status: "Paid" },
];

function StatusBadge({ status }) {
  const isPaid = status === "Paid";
  return (
    <div className={`badge ${isPaid ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} font-size-12`}>
      {status}
    </div>
  );
}

export default function InvoiceList() {
  return (
    <div className="col-xxl-5">
      <div className="card">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center mb-3">
            <h5 className="card-title me-2">Invoice List</h5>
            <div className="ms-auto">
              <div className="dropdown">
                <a
                  className="dropdown-toggle text-reset"
                  href="#"
                  id="invoiceSortDropdown"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="text-muted font-size-12">Sort By: </span>
                  <span className="fw-medium"> Weekly<i className="mdi mdi-chevron-down ms-1"></i></span>
                </a>
                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="invoiceSortDropdown">
                  <a className="dropdown-item" href="#">Monthly</a>
                  <a className="dropdown-item" href="#">Yearly</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-n4" data-simplebar style={{ maxHeight: "332px" }}>
            <div className="table-responsive">
              <table className="table table-striped table-centered align-middle table-nowrap mb-0 table-check">
                <thead>
                  <tr>
                    <th style={{ width: "30px" }}>
                      <div className="form-check font-size-16">
                        <input type="checkbox" className="form-check-input" id="checkAll" />
                        <label className="form-check-label" htmlFor="checkAll"></label>
                      </div>
                    </th>
                    <th>#Invoice</th>
                    <th style={{ width: "190px" }}>User Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={`${inv.id}-${i}`}>
                      <td>
                        <div className="form-check font-size-16">
                          <input type="checkbox" className="form-check-input" id={`invoiceCheck-${i}`} />
                          <label className="form-check-label" htmlFor={`invoiceCheck-${i}`}></label>
                        </div>
                      </td>
                      <td className="fw-semibold">{inv.id}</td>
                      <td style={{ width: "190px" }}>
                        <div className="d-flex align-items-center">
                          <img className="rounded-circle avatar-sm" src={inv.avatar} alt="" />
                          <div className="flex-grow-1 ms-3">{inv.name}</div>
                        </div>
                      </td>
                      <td>{inv.date}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td>
                        <div className="dropdown">
                          <a
                            className="text-muted dropdown-toggle font-size-18"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                          >
                            <i className="mdi mdi-dots-horizontal"></i>
                          </a>
                          <div className="dropdown-menu dropdown-menu-end">
                            <a className="dropdown-item" href="#">Edit</a>
                            <a className="dropdown-item" href="#">Print</a>
                            <a className="dropdown-item" href="#">Delete</a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
