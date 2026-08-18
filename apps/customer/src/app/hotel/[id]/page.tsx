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

export default function HotelDetail() {
  const params = useParams();
  const id = params.id as string;
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  // Room Selection State
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [added, setAdded] = useState(false);

  // Date & Time Requirements State
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
  const [checkInDate, setCheckInDate] = useState(tomorrow);
  const [checkOutDate, setCheckOutDate] = useState(threeDaysLater);
  const [checkInTime, setCheckInTime] = useState("02:00 PM - 04:00 PM (Standard)");
  const [guestsCount, setGuestsCount] = useState(2);

  // Calculate nights
  const nights = Math.max(
    1,
    Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)) || 1
  );

  // Active selected room
  const currentRoom = hotel?.rooms?.[selectedRoomIndex] || hotel?.rooms?.[0] || { price: 0, roomType: 'Standard Room', capacity: 2 };

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
    if (!hotel) return;
    const basePrice = currentRoom.price || 0;
    const totalPrice = basePrice * nights;
    
    addToCart({
      id: Date.now().toString(),
      itemModel: 'hotel',
      itemId: hotel._id,
      name: `${hotel.name} (${currentRoom.roomType})`,
      price: totalPrice,
      quantity: 1,
      selectedDate: `${checkInDate} to ${checkOutDate} (${nights} night${nights > 1 ? 's' : ''})`,
      selectedTime: checkInTime,
      details: {
        checkInDate,
        checkOutDate,
        nights,
        checkInTime,
        guests: guestsCount,
        roomType: currentRoom.roomType,
        roomPrice: currentRoom.price
      },
      image: hotel.images && hotel.images.length > 0 ? hotel.images[0] : ''
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Fetch hotel data
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`${API}/search/hotels/${id}`);
        const data = await res.json();
        if (data.success) setHotel(data.data);
      } catch (error) {
        console.error("Failed to fetch hotel", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHotel();
  }, [id, API]);

  // Fetch reviews for this hotel
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API}/reviews?itemId=${id}&itemType=hotel`);
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
        const res = await fetch(`${API}/reviews/can-review?itemId=${id}&itemType=hotel`, {
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
        body: JSON.stringify({ itemId: id, itemType: 'hotel', rating: reviewRating, comment: reviewComment })
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
          <div className="text-5xl animate-bounce">🏨</div>
          <div className="text-xl font-bold text-emerald-800">Preparing your stay...</div>
        </div>
      </div>
    );
  }

  if (!hotel) return <div className="text-center py-32 text-gray-500 font-bold text-xl">Hotel not found.</div>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : hotel.rating || 0;

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-emerald-900">
        <img 
          src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"} 
          alt={hotel.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FBF9] via-black/20 to-black/40"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 translate-y-8 z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">🍃</span> Eco-Certified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-amber-500">★</span> {avgRating} Rating
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-4 drop-shadow-sm">
            {hotel.name}
          </h1>
          <p className="text-xl font-bold text-gray-800 drop-shadow-md">
            📍 {hotel.location?.city}, {hotel.location?.country}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* Highlights */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">About this Hotel</h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10">
                {hotel.description || 'Experience unparalleled comfort while staying true to your eco-friendly values. This property operates on 100% renewable energy and features zero-waste dining options.'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🌿', label: 'Energy', value: '100% Solar' },
                  { icon: '♻️', label: 'Waste', value: 'Zero Waste' },
                  { icon: '📶', label: 'Policies', value: hotel.policies && hotel.policies.length > 0 ? 'Eco-Friendly' : 'Standard' },
                  { icon: '🏊', label: 'Pool', value: 'Chemical Free' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">Amenities &amp; Policies</h2>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  {hotel.rooms?.[0]?.amenities?.map((amenity: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">✓</div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
              
              {hotel.policies && hotel.policies.length > 0 && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Policies</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 font-medium">
                    {hotel.policies.map((policy: string, i: number) => (
                      <li key={i}>{policy}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Interactive Eco Map Section */}
            <section>
              <EcoMap 
                locationName={hotel.name}
                address={hotel.location?.address}
                city={hotel.location?.city}
                category="Eco Hotel & Stay"
              />
            </section>

            {/* ── Reviews Section ─────────────────────────────────────────── */}
            <section id="reviews">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900">Guest Reviews</h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl">
                    <StarDisplay rating={Number(avgRating)} />
                    <span className="font-black text-gray-900">{avgRating}</span>
                    <span className="text-gray-400 text-sm font-medium">({reviews.length})</span>
                  </div>
                )}
              </div>

              {/* Leave a Review Form */}
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
                  <p className="text-sm text-gray-500 font-medium mb-6">Your review is based on your completed stay.</p>
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
                        placeholder="Describe your experience — what did you love? What could be better?"
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
                  ✅ You have already reviewed this hotel. Thank you for your feedback!
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium">
                  No reviews yet. Be the first to share your experience!
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
                Highly Rated by EcoTravelers
              </div>

              <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
                <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-4xl font-black text-gray-900 tracking-tight">${currentRoom.price}</p>
                    <p className="text-sm font-bold text-gray-400 mb-1">/ night</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-700">{currentRoom.roomType}</p>
                    <p className="text-xs font-medium text-gray-400">All eco-fees included</p>
                  </div>
                </div>

                <div className="p-8">
                  {/* Select Stay Dates & Time */}
                  <div className="space-y-4 mb-6 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Your Stay Requirements</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Check-in Date</label>
                        <input
                          type="date"
                          value={checkInDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Check-out Date</label>
                        <input
                          type="date"
                          value={checkOutDate}
                          min={checkInDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Estimated Arrival Time</label>
                      <select
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      >
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Early Check-in)</option>
                        <option value="02:00 PM - 04:00 PM (Standard)">02:00 PM - 04:00 PM (Standard)</option>
                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                        <option value="After 06:00 PM (Late Arrival)">After 06:00 PM (Late Arrival)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-emerald-100/60 text-xs">
                      <span className="text-gray-500 font-medium">Duration: <strong className="text-gray-900">{nights} night{nights > 1 ? 's' : ''}</strong></span>
                      <span className="text-emerald-700 font-bold">Total: ${currentRoom.price * nights}</span>
                    </div>
                  </div>

                  {/* Room options UI with Radio Selection */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Available Rooms</h3>
                      <span className="text-[10px] font-bold text-gray-400">Click to Select</span>
                    </div>
                    {hotel.rooms?.map((room: any, i: number) => {
                      const isSelected = selectedRoomIndex === i;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setSelectedRoomIndex(i)}
                          className={`w-full text-left flex justify-between items-center p-3.5 rounded-2xl transition-all cursor-pointer ${
                            isSelected
                              ? 'border-2 border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-500/20'
                              : 'border border-gray-200/80 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'border-2 border-gray-300 bg-white'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </div>
                            <div>
                              <div className={`font-bold text-sm leading-tight ${isSelected ? 'text-emerald-950 font-black' : 'text-gray-900'}`}>
                                {room.roomType}
                              </div>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">Capacity: {room.capacity} Guests</div>
                            </div>
                          </div>
                          <div className="text-right pl-2">
                            <div className={`text-sm font-black ${isSelected ? 'text-emerald-700' : 'text-gray-900'}`}>
                              ${room.price}/nt
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-emerald-600">Selected</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={handleReserve}
                    disabled={added}
                    className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-base sm:text-lg ${added ? 'bg-gray-900 shadow-gray-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
                  >
                    {added ? 'Added to Cart ✓' : `Reserve ${currentRoom.roomType} • $${currentRoom.price * nights}`}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-bold mt-4">Free cancellation for 48 hours</p>
                </div>
              </div>
              
              {/* Extra Trust Indicator */}
              <div className="mt-6 flex items-center justify-center gap-3 text-gray-500">
                <span className="text-xl">🛡️</span>
                <span className="text-xs font-bold uppercase tracking-wider">Verified Sustainable</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
