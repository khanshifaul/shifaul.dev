"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteNewsletterSubscriber, getNewsletterSubscribers, NewsletterSubscriber } from "@/lib/actions/newsletterApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeleteDialog from "../../_components/delete-dialog";

const NewsletterSubscriberTable = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNewsletterSubscribers({
        page: 1,
        limit: 100
      });

      if (response.data.success) {
        setSubscribers(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch subscribers');
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchSubscribers();
    }
  }, [isLoggedIn]);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await deleteNewsletterSubscriber(id);

      if (response.data.success) {
        // Remove the deleted subscriber from the local state
        setSubscribers(prev => prev.filter(subscriber => subscriber.id !== id));
        router.refresh();
      } else {
        setError(response.data.message || 'Failed to delete subscriber');
      }
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <p className="text-center py-4">Please log in to view subscribers.</p>;
  }

  if (loading && subscribers.length === 0) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="w-full">
      <Table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <TableHeader className="bg-gray-300 dark:bg-gray-900">
          <TableRow>
            <TableHead className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Sl.
            </TableHead>
            <TableHead className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Email
            </TableHead>
            <TableHead className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Subscribed At
            </TableHead>
            <TableHead className="px-4 py-2 text-gray-700 dark:text-gray-300">
              Delete
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-4 text-gray-700 dark:text-gray-300"
              >
                No Subscribers Found
              </TableCell>
            </TableRow>
          ) : (
            subscribers.map((subscriber, index) => (
              <TableRow
                key={subscriber.id}
                className="hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <TableCell className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {index + 1}
                </TableCell>
                <TableCell className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {subscriber.email}
                </TableCell>
                <TableCell className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {subscriber.subscribedAt
                    ? new Date(subscriber.subscribedAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  <DeleteDialog
                    Id={subscriber.id}
                    item="subscriber"
                    onDelete={handleDelete}
                    prefetchAction={() => {
                      router.refresh();
                    }}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default NewsletterSubscriberTable;