import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import RichTextEditor from "../components/RichTextEditor";
import CategorySelector from "../components/CategorySelector";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(
        collection(db, "posts"),
        where("author", "==", currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => doc.data());
      setPosts(postsData);
    };
    fetchPosts();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        author: currentUser.email,
        createdAt: new Date(),
      });
      setTitle("");
      setContent("");
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded"
              required
            />
            <CategorySelector
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Content</label>
            <RichTextEditor
              content={content}
              onChange={(html) => setContent(html)}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Publish
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-medium">{post.title}</h3>
                <p className="text-gray-600 mt-2">{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't created any posts yet.</p>
        )}
      </div>
    </div>
  );
}
