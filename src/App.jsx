import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UserLogIn from "./pages/UserLogIn";
import UserRegistration from "./pages/UserRegistration";
import MainLayout from "./MainLayout/MainLayout";
import ProtectedRoute from "./component/Authentication/ProtectedRoute";
import HomePage from "./pages/HomePage";
import EditProfile from "./pages/EditProfile";
import Profile from "./pages/Profile";
import UrlScan from "./component/UrlScan/WebcamScan";
import UrlSearchBar from "./component/UrlScan/SearchBarUrl";
import ImageExtract from "./component/UrlScan/ImageExtract"
import ScanHistory from "./pages/ScanHistory";
import InfoCenter from "./pages/InfoCenter";
import GeminiChat from "./pages/GeminiChatbot";
import PipWindow from "./component/UrlScan/Components/PipWindow/PipWindow";
import NotFoundPage from "./pages/NotFoundPage";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/login" element={<UserLogIn />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/" element={<LandingPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/user-profile" element={<Profile />} />
          <Route path="/url-scan/webcam" element={<UrlScan />} />
          <Route path="/url-scan/pip-window" element={<PipWindow />} />
          <Route path="/url-scan/search" element={<UrlSearchBar />} />
          <Route path="/url-scan/image" element={<ImageExtract />} />
          <Route path="/support/info" element={<InfoCenter />} />
          <Route path="/support/chatbot" element={<GeminiChat />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<ScanHistory />} />
          {/* <Route path="/support" element={<Support />} /> 
          <Route path="*" element={<NotFoundPage />} /> */} 
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
