import React from 'react';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FaqPage = () => {
  return (
    <>
    <div className='flex py-5'><Link to='/'><FaHome className='h-6 w-6 m-5'/></Link><h1 className='text-4xl font-bold mx-auto my-auto'>Sportsync</h1></div><hr/>
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. How do I sign in to SportSync?</h2>
          <p className="text-lg">To sign in to SportSync, simply click on the "Sign In with Google" button on the homepage. You'll be redirected to Google's authentication page where you can choose your Google account to sign in.</p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Is my personal information safe with SportSync?</h2>
          <p className="text-lg">Yes, we take the security and privacy of your personal information very seriously. When you sign in with Google, we only receive basic profile information like your name and email address. We do not store any sensitive information without your explicit consent.</p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Can I use multiple Google accounts with SportSync?</h2>
          <p className="text-lg">Yes, you can use multiple Google accounts with SportSync. Each time you sign in, you'll be prompted to choose the Google account you want to use for authentication.</p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. How do I revoke access to my Google account from SportSync?</h2>
          <p className="text-lg">To revoke access to your Google account from SportSync, you can go to your Google account settings, navigate to "Security" and "Third-party apps with account access", and remove SportSync from the list of connected apps.</p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. What should I do if I encounter any issues with signing in?</h2>
          <p className="text-lg">If you encounter any issues with signing in to SportSync, please reach out to our support team at support@sportsync.com. We'll be happy to assist you and resolve any problems you may be experiencing.</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default FaqPage;
