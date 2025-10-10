import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, User, Calendar } from 'lucide-react';

const CountryExperience = () => {
  const { countryName } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cachedPosts = localStorage.getItem(`posts-${countryName}`);
    if (cachedPosts) {
      setPosts(JSON.parse(cachedPosts));
    }
  }, [countryName]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all w-full sm:w-auto"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Countries
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-center sm:text-left bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Traveler Experiences for {countryName}
        </h2>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {posts.map(post => (
          <div
            key={post.id}
            className="group p-5 sm:p-6 rounded-xl border transition-all duration-300 
                      hover:transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-900/10 bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-600/80"
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-base sm:text-lg font-medium text-zinc-100 mb-3">{post.content}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-zinc-500" />
                    {post.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto max-w-md">
              <div className="text-zinc-400 mb-3">No experiences found for {countryName}</div>
              <button 
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                onClick={() => navigate('/')}
              >
                Browse Countries
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryExperience;
