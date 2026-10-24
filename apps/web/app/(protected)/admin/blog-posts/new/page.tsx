
import type { Metadata } from "next";
import NewBlogPostForm from "../_components/create-blogpost-form";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Create New BlogPost",
};
const NewBlogPost = () => {
  return (
    <div>
      <NewBlogPostForm />
    </div>
  );
};

export default NewBlogPost;
