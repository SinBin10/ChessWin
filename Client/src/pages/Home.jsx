import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="h-full bg-slate-900 flex flex-col justify-center items-center">
      <div>
        <Link to="/play">
          <button className="bg-blue-600 p-2 rounded-xl text-white mb-8">
            Play with a friend
          </button>
        </Link>
      </div>
      <div>
        <Link to="/play">
          <button className="bg-blue-600 p-2 rounded-xl text-white">
            Play as Guest
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
