import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import PostCard from '../components/PostCard';

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryTerm = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchPosts = async () => {
      if (!queryTerm) return;

      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('keywords', 'array-contains', queryTerm.toLowerCase())
      );

      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => doc.data());
      setResults(postsData);
      setLoading(false);
    };

    searchPosts();
  }, [queryTerm]);

  // Update your Firestore posts to include a "keywords" array
  // that contains lowercase versions of all searchable terms

  if (loading) return <div>Searching...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{queryTerm}"
      </h1>
      
      {results.length > 0 ? (
        <div className="grid gap-6">
          {results.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p>No posts found matching your search.</p>
      )}
    </div>
  );
}