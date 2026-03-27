import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    province: '',
    city: '',
    address: '',
    postalCode: '',
    phone: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        country: userProfile.country || '',
        province: userProfile.province || '',
        city: userProfile.city || '',
        address: userProfile.address || '',
        postalCode: userProfile.postalCode || '',
        phone: userProfile.phone || '',
        notes: userProfile.notes || ''
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setSaveMessage('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData
      });
      setSaveMessage('Profile updated successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error("Error updating profile", error);
      setSaveMessage('Error updating profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-12 border-b border-border pb-6">
        <h1 className="text-4xl font-serif text-neutral">My Profile</h1>
      </div>

      <div className="bg-surface p-8 border border-border">
        <h2 className="text-2xl font-serif mb-6 text-neutral">Personal Information</h2>
        
        {saveMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 text-green-500 flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            {saveMessage}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">First Name</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Last Name</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Email</label>
            <input type="email" value={user.email || ''} disabled className="w-full bg-primary/50 border border-border px-4 py-3 text-tertiary cursor-not-allowed" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11)})} pattern="\d{11}" maxLength={11} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Country</label>
              <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Full Address</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Province/State</label>
              <input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-tertiary mb-2">Postal/ZIP Code</label>
              <input type="text" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5)})} pattern="\d{5}" maxLength={5} className="w-full bg-primary border border-border px-4 py-3 text-neutral focus:outline-none focus:border-secondary" />
            </div>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-secondary text-primary text-xs uppercase tracking-widest hover:bg-neutral transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
