"use client";

import OverviewChart from "@/components/dashboard/OverviewChart";
import StatCard from "@/components/dashboard/StatCard";
import PopularProducts from "@/components/dashboard/PopularProducts";
import LoyalCustomers from "@/components/dashboard/LoyalCustomers";
import TopSellingCategories from "@/components/dashboard/TopSellingCategories";
import SalesRevenueMap from "@/components/dashboard/SalesRevenueMap";
import InvoiceList from "@/components/dashboard/InvoiceList";

export default function DashboardPage() {
  return (
    <div className="container-fluid">
      <div className="row">
        <OverviewChart />

        <div className="col-xl-6">
          <div className="row">
            <StatCard
              icon="bx bx-check-shield"
              title="Total Sales"
              value="$34,123.20"
              change="8.34%"
              trend="up"
              subtitle="Total Sales World Wide"
              data={[12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14]}
            />
            <StatCard
              icon="bx bx-cart-alt"
              title="Total Orders"
              value="63,234.20"
              change="3.68%"
              trend="down"
              subtitle="Total Orders World Wide"
              data={[65, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14]}
            />
          </div>
          <div className="row">
            <StatCard
              icon="bx bx-package"
              title="Today Visitor"
              value="425,34.45"
              change="2.64%"
              trend="down"
              subtitle="Total Visitor World Wide"
              data={[12, 75, 2, 47, 42, 15, 47, 75, 65, 19, 14]}
            />
            <StatCard
              icon="bx bx-rocket"
              title="Total Expense"
              value="6,482.46"
              change="5.79%"
              trend="up"
              subtitle="Total Expense World Wide"
              data={[12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 70]}
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xxl-8">
          <div className="row">
            <PopularProducts />
            <LoyalCustomers />
          </div>
        </div>
        <TopSellingCategories />
      </div>

      <div className="row">
        <SalesRevenueMap />
        <InvoiceList />
      </div>
    </div>
  );
}
