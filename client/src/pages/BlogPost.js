import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function BlogPost() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const postData = docSnap.data();
          setPost(postData);
          setIsLiked(currentUser && postData.likedBy?.includes(currentUser.email));
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return;
    
    try {
      const postRef = doc(db, 'posts', id);
      
      if (isLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likesCount: post.likesCount - 1,
          likedBy: arrayRemove(currentUser.email)
        });
        setPost({
          ...post,
          likesCount: post.likesCount - 1,
          likedBy: post.likedBy.filter(email => email !== currentUser.email)
        });
      } else {
        // Like the post
        await updateDoc(postRef, {
          likesCount: (post.likesCount || 0) + 1,
          likedBy: arrayUnion(currentUser.email)
        });
        setPost({
          ...post,
          likesCount: (post.likesCount || 0) + 1,
          likedBy: [...(post.likedBy || []), currentUser.email]
        });
      }
      
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading post...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!post) return <div className="text-center py-8">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="prose lg:prose-xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span>By {post.author}</span>
          <span className="mx-2">•</span>
          <span>
            {new Date(post.createdAt?.toDate()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          {post.updatedAt && (
            <>
              <span className="mx-2">•</span>
              <span>
                Updated: {new Date(post.updatedAt?.toDate()).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
        <div 
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      <div className="mt-8 flex items-center justify-between border-t border-b py-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleLike}
            disabled={!currentUser}
            className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            title={currentUser ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
          >
            {isLiked ? (
              <HeartSolid className="h-6 w-6" />
            ) : (
              <HeartOutline className="h-6 w-6" />
            )}
          </button>
          <span className="text-gray-700">{post.likesCount || 0} likes</span>
        </div>
        {currentUser?.email === post.author && (
          <div className="flex space-x-4">
            <a 
              href={`/dashboard?edit=${post.id}`} 
              className="text-blue-600 hover:text-blue-800"
            >
              Edit Post
            </a>
          </div>
        )}
      </div>

      <CommentSection postId={id} />
    </div>
  );
}