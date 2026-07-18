"use client";

const products = [
  { img: "/assets/images/product/img-7.png", name: "Branded T-Shirts", price: "$230.00", total: "$62300.00", sales: "562 Sales", bg: "bg-primary-subtle" },
  { img: "/assets/images/product/img-8.png", name: "Home & Office Chair Crime", price: "$190.00", total: "$25698.00", sales: "856 Sales", bg: "bg-success-subtle" },
  { img: "/assets/images/product/img-3.png", name: "Office Chair Blue", price: "$420.00", total: "$64351.00", sales: "524 Sales", bg: "bg-danger-subtle" },
  { img: "/assets/images/product/img-4.png", name: "Home & Office Chair Green", price: "$230.00", total: "$96485.00", sales: "634 Sales", bg: "bg-success-subtle" },
  { img: "/assets/images/product/img-5.png", name: "Wood Chair dark Brown", price: "$230.00", total: "$56230.00", sales: "964 Sales", bg: "bg-danger-subtle" },
];

export default function PopularProducts() {
  return (
    <div className="col-xl-7">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-start mb-2">
            <div className="flex-grow-1">
              <h5 className="card-title">Popular Products</h5>
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
                  Today<i className="mdi mdi-chevron-down ms-1"></i>
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

          <div data-simplebar style={{ maxHeight: "421px" }}>
            {products.map((p) => (
              <div className="popular-product-box rounded my-2" key={p.name}>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="avatar-md">
                      <div className={`product-img avatar-title img-thumbnail ${p.bg} border-0`}>
                        <img src={p.img} className="img-fluid" alt="" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3 overflow-hidden">
                    <h5 className="mb-1 text-truncate">
                      <a href="#" className="font-size-15 text-body">{p.name}</a>
                    </h5>
                    <p className="text-muted fw-semibold mb-0 text-truncate">{p.price}</p>
                  </div>
                  <div className="flex-shrink-0 text-end ms-3">
                    <h5 className="mb-1">
                      <a href="#" className="font-size-15 text-body">{p.total}</a>
                    </h5>
                    <p className="text-muted fw-semibold mb-0">{p.sales}</p>
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
