import { Link } from 'react-router-dom';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post }) {
  const { currentUser } = useAuth();
  const isLiked = currentUser && post.likedBy?.includes(currentUser.email);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.content.replace(/<[^>]*>/g, '')}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`p-1 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}>
              {isLiked ? (
                <HeartSolid className="h-5 w-5" />
              ) : (
                <HeartOutline className="h-5 w-5" />
              )}
            </span>
            <span className="text-sm text-gray-500">{post.likesCount || 0}</span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(post.createdAt?.toDate()).toLocaleDateString()}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Link 
            to={`/post/${post.id}`} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}