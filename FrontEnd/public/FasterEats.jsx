// FasterEats.jsx
import React from 'react';
import { Link } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  🥙  dummy data — swap these with real media / API responses        */
/* ------------------------------------------------------------------ */
const categories = [
    { name: 'Biryani', img: '/public/briyani.png' },
    { name: 'Pizza', img: '/public/pizza.png' },
    { name: 'Cake', img: '/public/cake.png' },
    { name: 'Idli', img: '/public/idli.png' },
    { name: 'Chinese', img: '/public/noodles.png' },
    { name: 'Dosa', img: '/public/dosa.png' },
    { name: 'Pasta', img: '/public/pasta (2).png' },
    { name: 'Momo', img: '/public/momo.png' },
    { name: 'Rolls', img: '/public/rolls.png' },
    { name: 'Kebab', img: '/public/kebab.png' }
];

const restaurants = [
    {
        name: 'Lord of the Drinks',
        cuisines: 'Continental • North Indian',
        price: 'Rs 2500 for two',
        distance: '4.7 km',
        img: '/public/res1.jpeg',
        discount: '40 % OFF'
    },
    {
        name: 'Enoki',
        cuisines: 'Chinese • Sushi',
        price: 'Rs 1200 for two',
        distance: '1.4 km',
        img: '/public/res2.jpg',
        discount: '20 % OFF'
    },
    {
        name: 'Message In A Bottle',
        cuisines: 'Chinese • North Indian',
        price: 'Rs 1600 for two',
        distance: '1.4 km',
        img: '/public/res4.jpg',
        discount: '30 % OFF'
    },
    {
        name: 'Mamagoto',
        cuisines: 'Chinese • Asian',
        price: 'Rs 1800 for two',
        distance: '2.2 km',
        img: '/public/res3.jpeg',
        discount: '25 % OFF'
    }
];

/* ------------------------------------------------------------------ */
/*  🔥  component                                                      */
/* ------------------------------------------------------------------ */
export default function FasterEats() {
    return (
        <div className="font-sans antialiased">
            {/* ---------- Header ---------- */}
            <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8" />
                    <span className="text-xl font-semibold">FasterEats</span>
                </Link>
                <div className="flex gap-4">
                    <Link
                        to="/login"
                        className="px-5 py-2 font-medium rounded-full hover:bg-gray-100 transition"
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2 font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition"
                    >
                        Sign up
                    </Link>
                </div>
            </header>

            {/* ---------- Hero ---------- */}
            <section className="relative flex flex-col items-center text-center text-white bg-orange-500">
                {/* decorative veg/ sushi sides (optional) */}
                <img
                    src="https://via.placeholder.com/160x400?text=Left"
                    alt=""
                    className="hidden lg:block absolute left-0 bottom-0"
                />
                <img
                    src="https://via.placeholder.com/160x400?text=Right"
                    alt=""
                    className="hidden lg:block absolute right-0 top-0"
                />

                <div className="max-w-4xl py-20 px-6 z-10">
                    <h1 className="mb-4 text-4xl font-bold md:text-5xl leading-tight">
                        Order food & groceries.<br />
                        Discover best restaurants. <span className="text-black/70">FasterEats it!</span>
                    </h1>

                    {/* location + search */}
                    <div className="flex flex-col gap-3 md:flex-row md:gap-5 mt-8">
                        <select
                            className="flex-1 md:max-w-xs px-4 py-3 rounded-lg text-gray-700"
                            defaultValue="Colombo"
                        >
                            {['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Matara'].map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                        <input
                            placeholder="Search for restaurant, item or more"
                            className="flex-1 px-4 py-3 rounded-lg text-gray-700"
                        />
                    </div>
                </div>
            </section>



            {/* ---------- Food categories ---------- */}
            <section className="max-w-screen-xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">What’s on your mind?</h2>
                </div>

                <div className="flex overflow-x-auto gap-10 pb-4">
                    {categories.map((c) => (
                        <div key={c.name} className="flex-shrink-0 text-center w-28">
                            <img src={c.img} alt={c.name} className="w-28 h-28 object-cover rounded-full" />
                            <p className="mt-2 font-medium">{c.name}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------- NEW PART : Partner / Courier signup ( redesigned ) ---------- */}
            <section className="max-w-screen-xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Restaurant partner card */}
                    <Link
                        to="/partner/signup"
                        className="relative h-64 rounded-2xl overflow-hidden group"
                    >
                        <img
                            src="/public/kitchen.jpg"
                            alt="Add your restaurant"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* dark overlay */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        {/* text + cta */}
                        <div className="relative z-10 flex flex-col justify-end h-full p-6">
                            <h3 className="text-3xl font-bold text-white mb-3">
                                Your restaurant, delivered
                            </h3>
                            <span className="mx-auto px-4 py-2 bg-white text-black text-sm font-semibold rounded-full group-hover:bg-orange-500 group-hover:text-white transition">
                                Add your restaurant
                            </span>
                        </div>
                    </Link>

                    {/* Courier card */}
                    <Link
                        to="/courier/signup"
                        className="relative h-64 rounded-2xl overflow-hidden group"
                    >
                        <img
                            src="/public/delivery.jpeg"
                            alt="Sign up to deliver"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                        <div className="relative z-10 flex flex-col justify-end h-full p-6">
                            <h3 className="text-3xl font-bold text-white mb-3">
                                Deliver with FasterEats
                            </h3>
                            <span className="mx-auto px-4 py-2 bg-white text-black text-sm font-semibold rounded-full group-hover:bg-orange-500 group-hover:text-white transition">
                                Sign up to deliver
                            </span>

                        </div>
                    </Link>
                </div>
            </section>

            {/* ---------- Discounted restaurants ---------- */}
            <section className="max-w-screen-xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">
                        Discover best restaurants with offers
                    </h2>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-4">
                    {restaurants.map((r) => (
                        <div
                            key={r.name}
                            className="relative flex-shrink-0 w-80 rounded-2xl shadow hover:shadow-lg transition"
                        >
                            <img
                                src={r.img}
                                alt={r.name}
                                className="w-full h-48 object-cover rounded-t-2xl"
                            />
                            <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                {r.discount}
                            </span>
                            <div className="p-4 space-y-1">
                                <h3 className="font-semibold">{r.name}</h3>
                                <p className="text-sm text-gray-600">{r.cuisines}</p>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>{r.price}</span>
                                    <span>{r.distance}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>




            {/* ---------- Footer ---------- */}
            <footer className="bg-gray-100 mt-24">
                <div className="max-w-screen-xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/public/FasterEatsLogo.png" alt="logo" className="w-8 h-8" />
                            <span className="text-lg font-semibold">FasterEats</span>
                        </div>
                        <p className="text-gray-500">© 2025 FasterEats (Pvt) Ltd</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li>About us</li>
                            <li>Careers</li>
                            <li>Team</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Contact us</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li>Help &amp; Support</li>
                            <li>Partner with us</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Available in:</h4>
                        <ul className="space-y-2 text-gray-600">
                            {['Colombo', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Kurunegala'].map((c) => (
                                <li key={c}>{c}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Follow us</h4>
                        <div className="flex gap-4 text-gray-600">
                            <i className="fab fa-facebook-f"></i>
                            <i className="fab fa-instagram"></i>
                            <i className="fab fa-twitter"></i>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
