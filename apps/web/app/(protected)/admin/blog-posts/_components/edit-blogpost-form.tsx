"use client";

import { updateBlogPost, UpdateBlogPostRequest } from "@/lib/actions/blogApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { IBlogPost } from "@/types/globals";
import React, { useState } from "react";
import { BlogPostForm, BlogPostFormInput } from "./blog-post-form";

interface EditBlogPostFormProps {
  blogPost: IBlogPost;
}

const EditBlogPostForm: React.FC<EditBlogPostFormProps> = ({ blogPost }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isLoggedIn } = useAuth();

  const initialData: BlogPostFormInput = {
    title: blogPost.title,
    slug: blogPost.slug,
    content: blogPost.content,
    thumbnail: blogPost.thumbnail || "",
    tags: (blogPost.tags || []).map(t => typeof t === 'string' ? t : t.name).join(", "),
    published: blogPost.published,
  };

  const onSubmit = async (values: BlogPostFormInput) => {
    if (!isLoggedIn) {
      setError("You must be logged in to update a blog post");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData: UpdateBlogPostRequest = {
        title: values.title,
        content: values.content,
        thumbnail: values.thumbnail || '',
        published: values.published,
        tags: values.tags
          ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await updateBlogPost(blogPost.id, updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating blog post:", err);
      setError(err instanceof Error ? err.message : "Failed to update blog post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-2">
      <BlogPostForm
        initialData={initialData}
        onSubmit={onSubmit}
        loading={loading}
        buttonTextMap={{ draft: "Save as Draft", publish: "Update Post" }}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-500 text-sm mt-2">Blog post updated successfully!</p>}
    </div>
  );
};

export default EditBlogPostForm;
