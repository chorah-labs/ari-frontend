import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const EmailVerifiedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Email verified</h1>
        <p className="text-gray-400 mb-6">
          {email
            ? `Your account (${email}) has been verified!`
            : `Your account has been verified!`}
        </p>
        <p className="text-gray-400 mb-6"> 
          You are now ready to use the ARI Platform. Let's work towards faster cures, together.
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;