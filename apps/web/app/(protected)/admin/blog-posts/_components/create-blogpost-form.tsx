"use client";

import { createBlogPost } from "@/lib/actions/blogApi";
import { useAuth } from "@/lib/hooks/useAuth";
import React, { useState } from "react";
import { BlogPostForm, BlogPostFormInput } from "./blog-post-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const NewBlogPostForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: _user } = useAuth();
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const onSubmit = async (values: BlogPostFormInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

      if (!accessToken) {
        toast.error('No access token found. Please log in again.');
        router.push('/sign-in');
        return;
      }

      const blogPostData = {
        ...values,
        thumbnail: values.thumbnail || undefined,
        tags: values.tags
          ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await createBlogPost(blogPostData, accessToken);
      setSuccess(true);
      toast.success('Blog post created successfully!');
      setTimeout(() => setSuccess(false), 3000);
      router.push('/admin/blog-posts');

    } catch (err) {
      console.error("Error creating blog post:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create blog post";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Blog Post</h1>
      <BlogPostForm onSubmit={onSubmit} loading={loading} />
      {error && <div className="text-red-500 mt-4">Error: {error}</div>}
      {success && <div className="text-green-500 mt-4">Blog post created successfully!</div>}
    </div>
  );
};

export default NewBlogPostForm;
