import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaEye, FaDownload } from 'react-icons/fa';
import FileViewer from "./fileViewer";

const InvoiceContainer = styled.div`
  max-width: 210mm;
  padding: 20px;
  margin: auto;
  font-family: Arial, sans-serif;
  color: #333;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
`;

const TableContainer = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: left;
`;

const Td = styled.td`
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;
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

function ViewTicket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [priorityLevels, setPriorityLevels] = useState([
    { priorityLevel: 4, priorityName: 'Low', keywords: ['low', 'minor', 'routine'] },
    { priorityLevel: 3, priorityName: 'Medium', keywords: ['medium', 'moderate'] },
    { priorityLevel: 2, priorityName: 'High', keywords: ['high', 'urgent', 'important'] },
    { priorityLevel: 1, priorityName: 'Critical', keywords: ['critical', 'severe', 'emergency'] }
  ]);
  const [previewLoading, setPreviewLoading] = useState(true);
  useEffect(() => {
    async function fetchAPI() {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/track/email/${id}`);
        const repliedEmailResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/track/email/replied/${id}`);
        const emailData = response.data.email;
        const ticketData = {
          id: emailData.threadId,
          complaint_id: emailData.threadId,
          priority: determinePriority(emailData.snippet),
          assignee: "Arun Singh",
          creationDate: new Date(emailData.date).toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          }),
          status: "Open",
          description: emailData.snippet,
          resolution: null,
          comments: repliedEmailResponse.data.repliedEmails || [],
          attachments: emailData.body?.attachments || [],
          createdBy: emailData.from.split(" <")[0].replace(/"/g, ''),
          lastUpdated: new Date(emailData.date).toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          }),
        };
        setTicket(ticketData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchAPI();
  }, []);

  const determinePriority = (snippet) => {
    for (const level of priorityLevels) {
      if (level.keywords.some(keyword => snippet.toLowerCase().includes(keyword))) {
        return level.priorityName;
      }
    }
    return 'Low';
  };

  const handleViewAttachment = async (ticketId, attachmentUrl, attachmentName) => {
    const url = `${process.env.REACT_APP_BASE_URL}/track/email/attachments/${ticketId}/${attachmentUrl}/${attachmentName}`;
    setAttachmentUrl(url);
    setIsModalOpen(true);
    setPreviewLoading(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewLoading(false);
  };

  if (!ticket) {
    return <p>Loading ticket details...</p>;
  }

  return (
    <InvoiceContainer id="invoice">
      <Header>
        <div>
          <Title>Ticket Details</Title>
          <p>
            <strong>Complaint ID:</strong> {ticket.complaint_id}
          </p>
        </div>
        <div>
          <p>
            <strong>Assignee:</strong> {ticket.assignee}
          </p>
          <p>
            <strong>Status:</strong> {ticket.status}
          </p>
        </div>
      </Header>

      <TableContainer>
        {loading && (
          <LoadingOverlay>Please wait, data is loading...</LoadingOverlay>
        )}
        <Table>
          <thead>
            <tr>
              <Th>Description</Th>
              <Th>Priority</Th>
              <Th>Creation Date</Th>
              <Th>Last Updated</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>{ticket.description}</Td>
              <Td>{ticket.priority}</Td>
              <Td>{ticket.creationDate}</Td>
              <Td>{ticket.lastUpdated}</Td>
            </tr>
          </tbody>
        </Table>
      </TableContainer>

      <TableContainer>
        <h3>Attachments</h3>
        <Table>
          <thead>
            <tr>
              <Th>S.No</Th>
              <Th>Attachment Name</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {ticket && ticket?.attachments?.length > 0 ? (
              ticket.attachments.map((attachment, index) => (
                <tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{attachment.name}</Td>
                  <Td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewAttachment(ticket.id, attachment.url, attachment.name);
                      }}
                      style={{ marginRight: '10px' }}
                      title="View Attachment"
                    >
                      <FaEye />
                    </a>
                    <a
                      href={`${process.env.REACT_APP_BASE_URL}/track/email/attachments/${ticket.id}/${attachment.url}/${attachment.name}?action=download`}
                      download={`Attachment_${index + 1}`}
                      style={{ marginLeft: '7px' }}
                      title="Download Attachment"
                    >
                      <FaDownload />
                    </a>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="3">No attachments available.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      <TableContainer>
        <h3>Comments</h3>
        <Table>
          <thead>
            <tr>
              <Th>S.No</Th>
              <Th>Commenter</Th>
              <Th>Comment</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {ticket && ticket?.comments?.length > 0 ? (
              ticket.comments.map((comment, index) => (
                <tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{comment.commenter}</Td>
                  <Td>{comment.comment}</Td>
                  <Td>{comment.createdAt}</Td>
                  <Td>
                    {comment.attachments && comment.attachments.attachments.length > 0 ? (
                      <table style={{ width: '100%' }}>
                        <tbody>
                          {comment.attachments.attachments.map((attachment, attachIndex) => (
                            <tr key={attachIndex}>
                              <td>{attachment.name}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleViewAttachment(ticket.id, attachment.url, attachment.name);
                                    }}
                                    title="View Attachment"
                                    style={{ marginRight: '10px' }}
                                  >
                                    <FaEye />
                                  </a>
                                  <a
                                    href={`${process.env.REACT_APP_BASE_URL}/track/email/attachments/${ticket.id}/${attachment.url}/${attachment.name}?action=download`}
                                    download={`Attachment_${attachIndex + 1}`}
                                    title="Download Attachment"
                                  >
                                    <FaDownload />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span>No attachments</span>
                    )}
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <Td colSpan="5">No comments available.
                  <p>Note: Comments will only be visible if the respondent chooses to <span style={{ color: 'red' }}>"Reply All"</span></p>
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      <FileViewer
        isOpen={isModalOpen}
        onClose={closeModal}
        url={attachmentUrl}
        previewLoading={previewLoading}
        setPreviewLoading={setPreviewLoading}
      />

      <FooterContainer>
        <div>
          <p>
            <strong>Reported By:</strong> {ticket.createdBy}
          </p>
        </div>
      </FooterContainer>
    </InvoiceContainer>
  );
}

export default ViewTicket;
