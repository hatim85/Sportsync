import React from 'react';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <>
    <div className='flex py-5'><Link to='/'><FaHome className='h-6 w-6 m-5'/></Link><h1 className='text-4xl font-bold mx-auto my-auto'>Sportsync</h1></div><hr/>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy policy</h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg mb-4">
            At SportSync, we are committed to protecting the privacy and security of our users' personal information. This Privacy Policy outlines how we collect, use, and safeguard the information you provide to us when using our website and services.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="text-lg mb-4">
            When you sign in to SportSync using Google OAuth, we collect basic profile information provided by your Google account, including your name and email address. We may also collect information related to your activity on our platform, such as the sports equipment you browse or purchase.
          </p>
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="text-lg mb-4">
            We use the information we collect to provide and improve our services, personalize your experience, communicate with you, and analyze trends and user behavior on our platform. We may also use your information to send you promotional and marketing communications, but you can opt out of these communications at any time.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-lg mb-4">
            We take appropriate measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use industry-standard security technologies and procedures to ensure the security of your data.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Sharing of Information</h2>
          <p className="text-lg mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or as necessary to provide our services. We may share your information with trusted third-party service providers who assist us in operating our platform and conducting our business.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Updates to this Privacy Policy</h2>
          <p className="text-lg mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this Privacy Policy periodically for any updates or changes.
          </p>
          <p className="text-lg">
            If you have any questions or concerns about our Privacy Policy or the use of your personal information, please contact us at privacy@sportsync.com.
          </p>
        </div>
      </div>
    </>
  );
};

export default Privacy;
