import { FiCalendar, FiEye, FiHeart } from "react-icons/fi";
import { BlogPost } from "@/lib/actions/blogApi";
import Link from "next/link";

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Create excerpt from content (first 150 characters)
  const createExcerpt = (content: string) => {
    // Remove markdown formatting and get plain text
    const plainText = content.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border hover:shadow-xl transition-shadow duration-300">
      {/* Blog Post Thumbnail */}
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Blog Post Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold text-card-foreground mb-3 line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {createExcerpt(post.content)}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {/* Author */}
            <span className="flex items-center gap-1">
              By {post.authorName}
            </span>

            {/* Date */}
            <span className="flex items-center gap-1">
              <FiCalendar className="w-4 h-4" />
              {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FiEye className="w-4 h-4" />
              {post.views}
            </span>
            <span className="flex items-center gap-1">
              <FiHeart className="w-4 h-4" />
              {post.reactions}
            </span>
          </div>
        </div>

        {/* Read More Link */}
        <div className="mt-4 pt-4 border-t border-border">
          <Link
            href={`/blog/${post.slug}`}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;