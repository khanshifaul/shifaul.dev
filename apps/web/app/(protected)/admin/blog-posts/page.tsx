
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageTitle from "../_components/page-title";
import RefreshBtn from "../_components/refresh-btn";
import BlogPostTable from "./_components/blogpost-table";

export const dynamic = 'force-dynamic';

const BlogPosts = async () => {
  return (
    <div>
      <PageTitle title="Blog Posts">
        <div className="flex gap-2">
          <RefreshBtn />
          <Button size={"sm"}>
            <Link href={"/admin/blog-posts/new"}>Add New BlogPost</Link>
          </Button>
        </div>
      </PageTitle>
      <BlogPostTable />
    </div>
  );
};

export default BlogPosts;
