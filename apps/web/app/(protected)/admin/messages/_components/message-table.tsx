"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactMessage, deleteContactMessage, getContactMessages } from "@/lib/actions/contactApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeleteDialog from "../../_components/delete-dialog";
import MessageSheet from "./message-sheet";

const MessagesTable = () => {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || undefined;
        const result = await getContactMessages({}, accessToken);
        if (result.data.success) {
          const data = result.data.data as any;
          if (Array.isArray(data)) {
            setMessages(data);
          } else if (data && typeof data === 'object' && 'messages' in data && Array.isArray(data.messages)) {
            setMessages(data.messages);
          } else {
            setMessages([]);
            console.warn("Unexpected data format for messages:", data);
          }
        } else {
          setMessages([]);
          setError(result.data.message || 'Failed to fetch messages');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleRowClick = (message: ContactMessage) => {
    setSelectedMessage(message);
  };

  const handleDelete = async (id: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || undefined;
      const result = await deleteContactMessage(id, accessToken);
      if (result.data.success) {
        // Remove the deleted message from the local state
        setMessages(prev => prev.filter(msg => msg.id !== id));
        router.refresh();
      } else {
        setError(result.data.message || 'Failed to delete message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message, index) => (
            <TableRow
              key={index}
              onClick={() => handleRowClick(message)}
              className="cursor-pointer"
            >
              <TableCell>{message.name}</TableCell>
              <TableCell>{message.email}</TableCell>
              <TableCell>{message.subject}</TableCell>
              <TableCell>
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <DeleteDialog
                  Id={message.id}
                  item="message"
                  onDelete={handleDelete}
                  prefetchAction={() => {
                    router.refresh();
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedMessage && (
        <MessageSheet
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
};

export default MessagesTable;
