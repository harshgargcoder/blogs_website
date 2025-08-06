import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import PostCard from '../components/PostCard';
import CategoryFilter from '../components/CategoryFilter';
import Search from '../components/Search';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-8">Loading posts...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            <Search />
            <CategoryFilter />
          </div>
        </div>
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>
          {posts.length > 0 ? (
            <div className="grid gap-8">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No posts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}