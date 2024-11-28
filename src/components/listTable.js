import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
  z-index: 1;
`;

function TicketTable() {
	const [ticketsData, setTicketsData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [priorityLevels, setPriorityLevels] = useState([
		{ priorityLevel: 4, priorityName: 'Low', keywords: ['low', 'minor', 'routine'] },
		{ priorityLevel: 3, priorityName: 'Medium', keywords: ['medium', 'moderate'] },
		{ priorityLevel: 2, priorityName: 'High', keywords: ['high', 'urgent', 'important'] },
		{ priorityLevel: 1, priorityName: 'Critical', keywords: ['critical', 'severe', 'emergency'] }
	]);
	const [assignee, setAssignee] = useState([
		{ totalAssignedTicket: 0, assigneeName: 'Arun Singh' },
		{ totalAssignedTicket: 0, assigneeName: 'Ashish Kumar' },
		{ totalAssignedTicket: 0, assigneeName: 'Shubhangi Jha' },
		{ totalAssignedTicket: 0, assigneeName: 'Kuldeep Singh' }
	]);
	const navigate = useNavigate();
	const handleViewTicket = (e, ticketData) => {
		navigate(`/details/${ticketData.thread_id}`);
	};

	const determinePriority = (snippet) => {
		for (const level of priorityLevels) {
			if (level.keywords.some(keyword => snippet.toLowerCase().includes(keyword))) {
				return level.priorityName;
			}
		}
		return 'Low';
	};

	useEffect(() => {
		async function fetchAPI() {
			try {
				const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/track/email`);
				const emails = response.data.emails;
				let assigneeIndex = 0;
				const emailData = emails.map((email) => {
					const currentAssignee = assignee[assigneeIndex];
					const ticket = {
						id: email.id,
						complaint_id: email.id,
						thread_id: email.threadId,
						complaint_subject: email.subject,
						reporter: email.from.split(" <")[0].replace(/"/g, ''),
						priority: determinePriority(email.snippet),
						assignee: currentAssignee.assigneeName,
						creationDate: new Date(email.date).toLocaleString("en-US", {
							day: "numeric",
							month: "short",
							year: "numeric",
							hour: "numeric",
							minute: "numeric",
						}),
					};
					currentAssignee.totalAssignedTicket += 1;
					assigneeIndex = (assigneeIndex + 1) % assignee.length;
					return ticket;
				});
				setTicketsData(emailData);
				setAssignee([...assignee]);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}

		fetchAPI();
	}, []);
	return (
		<div className="ticket-table">
			<h3>CRM Systems (Ticket Creation via Email)</h3>
			{loading && (
				<LoadingOverlay>Please wait, data is loading...</LoadingOverlay>
			)}
			<table>
				<thead>
					<tr>
						<th>Complaint ID</th>
						<th>Subject</th>
						<th>Reporter</th>
						<th>Priority</th>
						<th>Assignee</th>
						<th>CreatedAt</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{!loading &&
						ticketsData &&
						ticketsData.map((ticket, index) => (
							<tr key={index}>
								<td>{ticket.complaint_id}</td>
								<td>
									{ticket.complaint_subject
										? ticket.complaint_subject
										: "No Subject"}
								</td>
								<td>{ticket.reporter}</td>
								<td>{ticket.priority}</td>
								<td>{ticket.assignee}</td>
								<td>{ticket.creationDate}</td>
								<td>
									<button
										className="view-btn"
										onClick={(e) => handleViewTicket(e, ticket)}
									>
										👁️
									</button>
								</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}

export default TicketTable;
