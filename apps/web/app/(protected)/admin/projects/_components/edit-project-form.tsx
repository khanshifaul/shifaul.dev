"use client";

import { updateProject } from "@/lib/actions/projectsApi";
import { IProject } from "@/types/globals";
import React, { useState } from "react";
import { ProjectForm, ProjectFormInput } from "./project-form";

interface EditProjectFormProps {
  project?: IProject;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ project }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!project) return <div>No project data available</div>;

  // Transform IProject to ProjectFormInput
  const initialData: ProjectFormInput = {
    title: project.title,
    subtitle: project.subtitle || "",
    client: project.client || "",
    logo: project.logo || "",
    services: project.services || [],
    technologies: project.technologies || [],
    website: project.website || "",
    thumbnail: project.thumbnail || "",
    about: project.about || "",
    goal: project.goal || "",
    execution: project.execution || "",
    results: project.results || "",
    goalImages: (project.goalImages || []).map((url) => ({ url })),
    resultImages: (project.resultImages || []).map((url) => ({ url })),
  };

  const onSubmit = async (formData: ProjectFormInput) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    const projectInput = {
      ...formData,
      goalImages: formData.goalImages.map((img) => img.url),
      resultImages: formData.resultImages.map((img) => img.url),
    };

    try {
      await updateProject(project.id, projectInput, accessToken || undefined);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Optional: Refresh data or close dialog
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProjectForm
        initialData={initialData}
        onSubmit={onSubmit}
        loading={loading}
        buttonText="Update Project"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-500 text-sm mt-2">Project updated successfully!</p>}
    </div>
  );
};

export default EditProjectForm;
