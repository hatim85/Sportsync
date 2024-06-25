import React from 'react';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <>
    <div className='flex py-5'><Link to='/'><FaHome className='h-6 w-6 m-5'/></Link><h1 className='text-4xl font-bold mx-auto my-auto'>Sportsync</h1></div><hr/>
    <div className="container mx-auto py-5 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Terms and conditions</h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg mb-4">
          By accessing and using SportSync (the "Service"), you agree to be bound by these Terms and Conditions. Please read them carefully before using the Service.
        </p>
        <h2 className="text-2xl font-semibold mb-4">1. Use of the Service</h2>
        <p className="text-lg mb-4">
          You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms and Conditions.
        </p>
        <h2 className="text-2xl font-semibold mb-4">2. User Account</h2>
        <p className="text-lg mb-4">
          You may be required to create an account to access certain features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </p>
        <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
        <p className="text-lg mb-4">
          The Service and its original content, features, and functionality are owned by SportSync and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </p>
        <h2 className="text-2xl font-semibold mb-4">4. Limitation of Liability</h2>
        <p className="text-lg mb-4">
          To the fullest extent permitted by law, SportSync shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Service; (b) any conduct or content of any third party on the Service; (c) any content obtained from the Service; or (d) unauthorized access, use, or alteration of your transmissions or content.
        </p>
        <h2 className="text-2xl font-semibold mb-4">5. Governing Law</h2>
        <p className="text-lg mb-4">
          These Terms and Conditions shall be governed by and construed in accordance with the laws of [Your Country], without regard to its conflict of law provisions.
        </p>
        <p className="text-lg">
          If you have any questions or concerns about these Terms and Conditions, please contact us at legal@sportsync.com.
        </p>
      </div>
    </div>
    </>
  );
};

export default Terms;
