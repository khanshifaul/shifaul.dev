"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBlogPosts, deleteBlogPost } from "@/lib/actions/blogApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCurrentAccessToken } from "@/lib/store/slices/authSlice";
import { IBlogPost } from "@/types/globals";
import { useEffect, useState } from "react";
import DeleteDialog from "../../_components/delete-dialog";
import EditDialog from "../../_components/edit-dialog";
import EditBlogPostForm from "./edit-blogpost-form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPostTable = () => {
  const { isLoggedIn } = useAuth();
  const accessToken = useAppSelector(selectCurrentAccessToken);
  const [blogPosts, setBlogPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Transform BlogPost to IBlogPost format
  const transformBlogPosts = (posts: any[]): IBlogPost[] => {
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      thumbnail: post.thumbnail,
      content: post.content,
      reactions: post.reactions,
      views: post.views,
      authorId: post.authorId,
      authorName: post.authorName || post.author?.name || "Unknown",
      published: post.published,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
      tags: post.tags || [],
      excerpt: post.content?.substring(0, 150) + "..." || "",
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
    }));
  };

  const fetchBlogPosts = async (pageNum: number, query: string) => {
    if (!isLoggedIn || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getBlogPosts({ page: pageNum, limit: pageSize, search: query }, accessToken);

      if (response.data.success && response.data.data) {
        const transformedPosts = transformBlogPosts(response.data.data);
        setBlogPosts(transformedPosts);

        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.total);
        }
      } else {
        setError(response.data.message || "Failed to fetch blog posts");
      }
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch blog posts when page, search, or auth changes
  useEffect(() => {
    fetchBlogPosts(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, isLoggedIn, accessToken]);

  const handleDelete = async (id: string) => {
    if (!accessToken) {
      setError("Authentication required");
      return;
    }

    try {
      setError(null);

      const response = await deleteBlogPost(id, accessToken);

      if (response.data.success) {
        fetchBlogPosts(currentPage, debouncedSearch);
      } else {
        setError(response.data.message || "Failed to delete blog post");
      }
    } catch (err) {
      console.error("Error deleting blog post:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (!isLoggedIn) {
    return <div>Please log in to view blog posts.</div>;
  }

  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <Input
          placeholder="Search blog posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b dark:border-gray-600 text-gray-900 dark:text-gray-100">
            <TableHead className="p-2">Sl.</TableHead>
            <TableHead className="p-2">Title</TableHead>
            <TableHead className="p-2">Status</TableHead>
            <TableHead className="p-2">Created At</TableHead>
            <TableHead className="p-2 text-center">Edit</TableHead>
            <TableHead className="p-2 text-center">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <TableCell className="p-2 text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell className="p-2 font-medium"><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell className="p-2 text-center">
                  <Skeleton className="h-5 w-[70px] mx-auto rounded-full" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell className="p-2 text-center">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="p-2 text-center">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : blogPosts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-4 text-center">No blog posts found.</TableCell>
            </TableRow>
          ) : (
            blogPosts.map((post, index) => (
              <TableRow
                key={post.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <TableCell className="p-2 text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="p-2 font-medium">{post.title}</TableCell>
                <TableCell className="p-2 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="p-2">
                  {post.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell className="p-2 text-center">
                  <EditDialog>
                    <EditBlogPostForm blogPost={post} />
                  </EditDialog>
                </TableCell>
                <TableCell className="p-2 text-center">
                  <DeleteDialog
                    Id={post.id}
                    item="Blog Post"
                    onDelete={handleDelete}
                    prefetchAction={() => fetchBlogPosts(currentPage, debouncedSearch)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && blogPosts.length > 0 && (
        <div className="flex items-center justify-between mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} posts
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostTable;
