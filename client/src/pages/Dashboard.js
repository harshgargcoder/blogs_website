import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import RichTextEditor from "../components/RichTextEditor";
import CategorySelector from "../components/CategorySelector";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(
        collection(db, "posts"),
        where("author", "==", currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    };
    fetchPosts();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await updateDoc(doc(db, "posts", editingId), {
          title,
          content,
          categories: selectedCategories,
          updatedAt: new Date(),
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "posts"), {
          title,
          content,
          author: currentUser.email,
          categories: selectedCategories,
          createdAt: new Date(),
          updatedAt: new Date(),
          likesCount: 0,
          likedBy: [],
        });
      }

      setTitle("");
      setTitle("");
      setContent("");
      setSelectedCategories([]);

      if (currentUser) {
        const q = query(
          collection(db, "posts"),
          where("author", "==", currentUser.email)
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    setSelectedCategories(post.categories || []);
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
        setPosts(posts.filter((post) => post.id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Post" : "Create New Post"}
        </h2>
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
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Content</label>
            <RichTextEditor
              content={content}
              onChange={(html) => setContent(html)}
            />
          </div>

          <CategorySelector
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
          />

          <div className="flex justify-end space-x-4">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                  setSelectedCategories([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Publish"}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">{post.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Created: {new Date(post.createdAt?.toDate()).toLocaleString()}
                  {post.updatedAt && (
                    <span>
                      {" "}
                      • Updated:{" "}
                      {new Date(post.updatedAt?.toDate()).toLocaleString()}
                    </span>
                  )}
                </div>
                <div
                  className="text-gray-700 mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {post.likesCount || 0} likes
                  </span>
                  <a
                    href={`/post/${post.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Post
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any posts yet.</p>
        )}
      </div>
    </div>
  );
}
