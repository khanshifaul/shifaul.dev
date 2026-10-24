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
import { IProject, ITag } from "@/types/globals";

import { Input } from "@/components/ui/input";
import { deleteProject, getProjects } from "@/lib/actions/projectsApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import DeleteDialog from "../../_components/delete-dialog";
import EditDialog from "../../_components/edit-dialog";
import EditProjectForm from "./edit-project-form";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectTable = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const { user } = useAuth();

  const fetchProjects = async (pageNum: number, query: string) => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await getProjects({ page: pageNum, limit: pageSize, search: query }, accessToken);

      if (response.data.success && response.data.data) {
        const transformedProjects: IProject[] = response.data.data.map((project: any) => ({
          ...project,
          client: project.client || '',
          logo: project.logo || '',
          published: !!project.published,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          tags: (project.tags || []).map((tag: any) => ({
            ...tag,
            createdAt: new Date(),
            updatedAt: new Date(),
          })) as ITag[],
        }));
        setProjects(transformedProjects);

        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.total);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
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

  // Fetch projects when page, search, or user changes
  useEffect(() => {
    fetchProjects(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, user]);

  const handleDelete = async (id: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('No access token found');
      }

      await deleteProject(id, accessToken);

      // Refetch current page to update list and pagination data
      fetchProjects(currentPage, debouncedSearch);
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full mx-auto space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <Input
          placeholder="Search projects..."
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
            <TableHead className="p-2">Client</TableHead>
            <TableHead className="p-2">Status</TableHead>
            <TableHead className="p-2">Tags</TableHead>
            <TableHead className="p-2 text-center">Edit</TableHead>
            <TableHead className="p-2 text-center">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <TableCell className="p-2 text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell className="p-2 font-medium"><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell className="p-2"><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell className="p-2 text-center">
                  <Skeleton className="h-5 w-[70px] mx-auto rounded-full" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell className="p-2 text-center">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
                <TableCell className="p-2 text-center">
                  <Skeleton className="h-4 w-4 mx-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-4 text-center">No projects found.</TableCell>
            </TableRow>
          ) : (
            projects.map((project, index) => (
              <TableRow
                key={project.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-600 text-gray-900 dark:text-gray-100"
              >
                <TableCell className="p-2 text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="p-2 font-medium">{project.title}</TableCell>
                <TableCell className="p-2">{project.client}</TableCell>
                <TableCell className="p-2 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${project.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </TableCell>
                <TableCell className="p-2">
                  {(project.tags || []).map((tag) => tag.name).join(", ")}
                </TableCell>
                <TableCell className="p-2 text-center">
                  <EditDialog>
                    <EditProjectForm project={project} />
                  </EditDialog>
                </TableCell>
                <TableCell className="p-2 text-center">
                  <DeleteDialog
                    Id={project.id}
                    item="Project"
                    onDelete={handleDelete}
                    prefetchAction={() => fetchProjects(currentPage, debouncedSearch)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && projects.length > 0 && (
        <div className="flex items-center justify-between mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} projects
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
}; export default ProjectTable;
