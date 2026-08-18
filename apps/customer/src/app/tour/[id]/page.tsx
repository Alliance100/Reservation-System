"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import EcoMap from '@/components/EcoMap';

// ── Star display helper ───────────────────────────────────────────────────────
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 'text-2xl' : 'text-base';
  return (
    <span className={`inline-flex gap-0.5 ${px}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  );
}

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="inline-flex gap-1 text-3xl cursor-pointer select-none">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className={(hovered || value) >= s ? 'text-amber-400' : 'text-gray-300'}
        >★</span>
      ))}
    </span>
  );
}

export default function TourDetail() {
  const params = useParams();
  const id = params.id as string;
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [added, setAdded] = useState(false);

  // Date & Time Requirements State
  const [tourDate, setTourDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [tourTimeSlot, setTourTimeSlot] = useState("Morning Expedition (08:30 AM)");
  const [participants, setParticipants] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleReserve = () => {
    if (!tour) return;
    addToCart({
      id: Date.now().toString(),
      itemModel: 'tour',
      itemId: tour._id,
      name: tour.title,
      price: tour.price,
      quantity: participants,
      selectedDate: tourDate,
      selectedTime: tourTimeSlot,
      details: {
        tourDate,
        tourTimeSlot,
        durationDays: tour.durationDays,
        pickupPoint: tour.pickupPoint,
        participants
      },
      image: tour.images && tour.images.length > 0 ? tour.images[0] : ''
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`${API}/search/tours/${id}`);
        const data = await res.json();
        if (data.success) setTour(data.data);
      } catch (error) {
        console.error("Failed to fetch tour", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTour();
  }, [id, API]);

  // Fetch reviews for this tour
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API}/reviews?itemId=${id}&itemType=tour`);
        const data = await res.json();
        if (data.success) setReviews(data.data);
      } catch (e) { /* silent */ }
    };
    fetchReviews();
  }, [id, API]);

  // Check review eligibility for logged-in user
  useEffect(() => {
    if (!user || !id) return;
    const checkEligibility = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/reviews/can-review?itemId=${id}&itemType=tour`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCanReview(data.canReview);
          if (!data.canReview && data.reason === 'Already reviewed.') setAlreadyReviewed(true);
        }
      } catch (e) { /* silent */ }
    };
    checkEligibility();
  }, [user, id, API]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemId: id, itemType: 'tour', rating: reviewRating, comment: reviewComment })
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        setCanReview(false);
        setAlreadyReviewed(true);
        setReviewComment('');
        setReviewMsg('success');
      } else {
        setReviewMsg(`error:${data.message}`);
      }
    } catch (e) {
      setReviewMsg('error:Something went wrong. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">🍃</div>
          <div className="text-xl font-bold text-emerald-800">Preparing your adventure...</div>
        </div>
      </div>
    );
  }

  if (!tour) return <div className="text-center py-32 text-gray-500 font-bold text-xl">Tour not found.</div>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : tour.rating || 0;

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-emerald-900">
        <img 
          src={tour.images && tour.images.length > 0 ? tour.images[0] : "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1920&q=80"} 
          alt={tour.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FBF9] via-black/20 to-black/40"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 translate-y-8 z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">✓</span> Carbon Neutral
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">👥</span> Max {tour.maxGroupSize} People
            </span>
            {reviews.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
                <span className="text-amber-500">★</span> {avgRating} Rating
              </span>
            )}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-4 drop-shadow-sm">
            {tour.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* Highlights */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">Tour Overview</h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10">
                Immerse yourself in nature with our {tour.durationDays}-day eco-certified adventure. Every aspect of this tour has been designed to minimize environmental impact while maximizing your connection to the local ecosystem.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '⏱️', label: 'Duration', value: `${tour.durationDays} Days` },
                  { icon: '🥾', label: 'Activity Level', value: 'Moderate' },
                  { icon: '🗣️', label: 'Languages', value: 'English, Spanish' },
                  { icon: '🌱', label: 'Eco Impact', value: 'Positive' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary Timeline */}
            <section>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-gray-900">Your Itinerary</h2>
                <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-colors">
                  Download PDF
                </button>
              </div>

              <div className="relative border-l-4 border-emerald-100/50 ml-6 space-y-12 pb-4">
                {tour.itinerary?.map((item: any, i: number) => (
                  <div key={i} className="relative pl-10 group">
                    {/* Organic Dot */}
                    <div className="absolute -left-5 top-1 w-9 h-9 bg-white border-4 border-emerald-200 rounded-full flex items-center justify-center shadow-sm group-hover:border-emerald-500 group-hover:scale-110 transition-all">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    </div>
                    
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 group-hover:shadow-xl group-hover:shadow-emerald-900/5 transition-all">
                      <div className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2">Day {item.day}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4">{item.description?.split('.')[0] || `Exploring the Wild`}</h4>
                      <p className="text-gray-600 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {tour.pickupPoint && (
                <div className="mt-8 bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
                  <div className="text-2xl mt-1">📍</div>
                  <div>
                    <h4 className="font-bold text-emerald-900 mb-1">Pickup Information</h4>
                    <p className="text-emerald-800 font-medium">{tour.pickupPoint}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Interactive Eco Map Section */}
            <section>
              <EcoMap 
                locationName={tour.title}
                address={tour.pickupPoint}
                city={tour.pickupPoint}
                category="Nature Eco Tour"
              />
            </section>

            {/* ── Reviews Section ─────────────────────────────────────────── */}
            <section id="reviews">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900">Traveler Reviews</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl">
                    <StarDisplay rating={Number(avgRating)} />
                    <span className="font-black text-gray-900">{avgRating}</span>
                    <span className="text-gray-400 text-sm font-medium">({reviews.length})</span>
                  </div>
                )}
              </div>

              {!user && (
                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8 text-center">
                  <p className="text-gray-500 font-medium">
                    <a href="/login" className="text-emerald-600 font-bold hover:underline">Sign in</a> to leave a review.
                  </p>
                </div>
              )}

              {user && canReview && (
                <div className="bg-white border border-emerald-100 rounded-3xl p-8 mb-8 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-2">Share Your Experience</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">Your review is based on your completed tour.</p>
                  {reviewMsg === 'success' && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-bold text-sm">✅ Review submitted! Thank you.</div>
                  )}
                  {reviewMsg.startsWith('error:') && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold text-sm">❌ {reviewMsg.replace('error:', '')}</div>
                  )}
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating</label>
                      <StarPicker value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                      <textarea
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Describe your adventure — highlights, guides, what surprised you?"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none font-medium text-gray-800"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-sm transition-all disabled:opacity-60"
                    >
                      {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {user && alreadyReviewed && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 font-bold text-sm">
                  ✅ You have already reviewed this tour. Thank you for your feedback!
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium">
                  No reviews yet. Be the first to share your adventure!
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review: any) => (
                    <div key={review._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg">
                            {review.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{review.user?.name || 'Guest'}</p>
                            <p className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <StarDisplay rating={review.rating} />
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Sticky Booking Widget (Right) */}
          <div className="lg:col-span-5 xl:col-span-4 mt-16 lg:mt-0 relative">
            <div className="sticky top-32">
              
              {/* Trust/AI Badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 w-max bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                High Demand: 4 people looking now
              </div>

              <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
                <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-4xl font-black text-gray-900 tracking-tight">${tour.price}</p>
                    <p className="text-sm font-bold text-gray-400 mb-1">/ person</p>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Includes all taxes and eco-fees.</p>
                </div>

                <div className="p-8">
                  {/* Includes / Excludes UI */}
                  <div className="space-y-6 mb-8">
                    <div>
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">What's Included</h3>
                      <ul className="space-y-2">
                        {tour.inclusions?.map((inc: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-gray-600 font-medium">
                            <span className="text-emerald-500 mr-2.5 mt-0.5">✓</span> {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Not Included</h3>
                      <ul className="space-y-2">
                        {tour.exclusions?.map((exc: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-gray-400 font-medium line-through">
                            <span className="mr-2.5 mt-0.5 opacity-50">✗</span> {exc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {tour.dates && tour.dates.length > 0 && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2">Available Dates</h3>
                      <div className="flex flex-wrap gap-2">
                        {tour.dates.map((date: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700">
                            {new Date(date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Tour Date & Time */}
                  <div className="space-y-4 mb-6 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Your Tour Requirements</h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tour Date</label>
                      <input
                        type="date"
                        value={tourDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setTourDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Time Slot / Session</label>
                      <select
                        value={tourTimeSlot}
                        onChange={(e) => setTourTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      >
                        <option value="Morning Expedition (08:30 AM)">Morning Expedition (08:30 AM)</option>
                        <option value="Mid-Day Trek (12:00 PM)">Mid-Day Trek (12:00 PM)</option>
                        <option value="Sunset Wildlife Safari (04:30 PM)">Sunset Wildlife Safari (04:30 PM)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-emerald-100/60 text-xs">
                      <span className="text-gray-500 font-medium">Guests / Participants:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setParticipants(p => Math.max(1, p - 1))}
                          className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 font-black text-xs flex items-center justify-center"
                        >-</button>
                        <span className="font-black text-sm text-gray-900 w-4 text-center">{participants}</span>
                        <button
                          type="button"
                          onClick={() => setParticipants(p => Math.min(tour.maxGroupSize || 20, p + 1))}
                          className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleReserve}
                    disabled={added}
                    className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-lg ${added ? 'bg-gray-900 shadow-gray-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
                  >
                    {added ? 'Added to Cart ✓' : `Book for ${participants} Guest${participants > 1 ? 's' : ''} • $${tour.price * participants}`}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-bold mt-4">No charge until confirmed</p>
                </div>
              </div>
              
              {/* Extra Trust Indicator */}
              <div className="mt-6 flex items-center justify-center gap-3 text-gray-500">
                <span className="text-xl">🔒</span>
                <span className="text-xs font-bold uppercase tracking-wider">Bank-Level Security</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
