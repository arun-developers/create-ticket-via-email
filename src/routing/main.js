import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TicketTable from "../components/listTable";
import ViewTicket from "../components/detailsView";

function Main() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<TicketTable />} />
          <Route path="/details/:id" element={<ViewTicket />} />
        </Routes>
      </div>
    </Router>
  );
}

export default Main;
