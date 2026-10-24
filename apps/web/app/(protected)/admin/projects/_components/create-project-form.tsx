"use client";

import { createProject } from "@/lib/actions/projectsApi";
import { useAuth } from "@/lib/hooks/useAuth";
import React, { useState } from "react";
import { ProjectForm, ProjectFormInput } from "./project-form";

const CreateProjectForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user: _user } = useAuth();

  const onSubmit = async (formData: ProjectFormInput) => {
    // Clear previous states
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Auto-generate slug from title by replacing whitespace with underscores
    const slug = formData.title.trim().replace(/\s+/g, "_");

    // Get access token from localStorage or sessionStorage
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    // Prepare project input, mapping image objects to strings if necessary.
    const projectInput = {
      ...formData,
      slug,
      goalImages: formData.goalImages.map((img) => img.url),
      resultImages: formData.resultImages.map((img) => img.url),
    };

    try {
      const response = await createProject(projectInput, accessToken || undefined);
      console.log("Project created:", response.data);

      // Set success state
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Note: We might want to redirect or reset the form here
      // The form reset happens in ProjectForm if we passed a key or similar, 
      // but ProjectForm doesn't expose reset directly. 
      // For now, we rely on the user seeing the success message.
      // Ideally ProjectForm should take a ref or expose a reset callback, 
      // or we just unmount/remount it.

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred while creating the project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
      <ProjectForm onSubmit={onSubmit} loading={loading} buttonText="Create Project" />
      {error && (
        <p className="text-red-500 text-sm mt-2">Error: {error}</p>
      )}
      {success && (
        <p className="text-green-500 text-sm mt-2">
          Project created successfully!
        </p>
      )}
    </div>
  );
};

export default CreateProjectForm;
