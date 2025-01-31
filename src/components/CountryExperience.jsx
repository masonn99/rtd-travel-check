import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const CountryExperience = () => {
  const { countryName } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && content) {
      try {
        const newPost = {
          id: Date.now().toString(),
          name,
          content,
          timestamp: new Date()
        };
        setPosts([newPost, ...posts]);
        setName('');
        setContent('');
        setShowForm(false);
        setShowConfirmation(true);
        
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
        }, 3000);
      } catch (error) {
        console.error('Error posting experience:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition w-full sm:w-auto"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-center sm:text-left">Traveller Experiences for {countryName}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
        >
          <PlusCircle className="h-5 w-5" />
          {showForm ? 'Cancel' : 'Add Your Experience'}
        </button>
      </div>

      {showConfirmation && (
        <div className="mb-4 p-4 rounded-lg bg-green-500/20 text-green-500 border border-green-500/50">
          Experience successfully posted!
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-zinc-800 p-4 rounded-lg">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-2 p-2 bg-zinc-800 text-white border border-gray-300 rounded-lg"
            required
          />
          <textarea
            placeholder="Share your experience..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full mb-2 p-2 bg-zinc-800 text-white border border-gray-300 rounded-lg"
            required
          />
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition w-full sm:w-auto">
            Post
          </button>
        </form>
      )}

      <div className="space-y-3 sm:space-y-4">
        {posts.map(post => (
          <div
            key={post.id}
            className="group p-4 sm:p-6 rounded-lg sm:rounded-xl border backdrop-blur-sm transition-all duration-300 
                       hover:transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-zinc-900/20 bg-zinc-800/30 border-zinc-700/50 hover:bg-zinc-800/50"
          >
            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-zinc-300">
              <p className="text-base sm:text-lg font-medium text-zinc-100">{post.content}</p>
            </div>
            <div className="flex justify-between items-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-zinc-400">
                {post.name}
              </span>
              <span className="text-xs sm:text-sm text-zinc-400">
                {new Date(post.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 text-zinc-400">
            No experiences found. Be the first to share your experience!
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryExperience;