import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/Dashboard";
import Customers from "../pages/Customers";
import AllListings from "../pages/AllListings";
import Schemes from "../pages/Schemes";
import Approvals from "../pages/Approvals";
import ActiveListings from "../pages/ActiveListings";
import InactiveListings from "../pages/InactiveListings";
import RejectedListings from "../pages/RejectedListings";
import Orders from "../pages/Orders";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Categories from "../pages/Categories";
import Forms from "../pages/Forms";
import AuthGuard from "../components/AuthGuard";
import ApprovalDetails from "../pages/ApprovalDetails";

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<AuthGuard />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="categories" element={<Categories />} />
            <Route path="forms" element={<Forms />} />
            <Route path="all-listings" element={<AllListings />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="approvals/:type/:id" element={<ApprovalDetails />} />
            <Route path="active-listings" element={<ActiveListings />} />
            <Route path="inactive-listings" element={<InactiveListings />} />
            <Route path="rejected-listings" element={<RejectedListings />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;