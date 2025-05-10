/* ------------  src/pages/ListFoods.jsx ------------- */
import React, { useEffect, useState, useMemo, Fragment } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProfileModal from "../components/ProfileModal";
import { useLocation } from "react-router-dom";
import {
    AiOutlineClose,
    AiFillStar,
    AiOutlineStar,
    AiOutlinePlusCircle,
    AiOutlineMinusCircle,
    AiOutlineArrowLeft,
    AiOutlineShoppingCart,
} from "react-icons/ai";

/* ---------------- category data ---------------- */
const categories = [
    { name: "Biryani", img: "/public/briyani.png" },
    { name: "Pizza", img: "/public/pizza.png" },
    { name: "Cake", img: "/public/cake.png" },
    { name: "Idli", img: "/public/idli.png" },
    { name: "Chinese", img: "/public/noodles.png" },
    { name: "Dosa", img: "/public/dosa.png" },
    { name: "Pasta", img: "/public/pasta (2).png" },
    { name: "Momo", img: "/public/momo.png" },
    { name: "Rolls", img: "/public/rolls.png" },
    { name: "Kebab", img: "/public/kebab.png" },
];




const ads = [
    {
        title: "Free Delivery",
        description: "Get free delivery on orders above Rs. 1,200.",
        code: "FREEDEL",
        color: "bg-blue-100",
        textColor: "text-blue-800",
    },
    {
        title: "Lunch Special",
        description: "Flat Rs. 300 off between 12pm–2pm.",
        code: "LUNCH300",
        color: "bg-yellow-100",
        textColor: "text-yellow-800",
    },
    {
        title: "Weekend Treat",
        description: "Buy 1 Get 1 Free on Desserts this weekend.",
        code: "WEEKENDTREAT",
        color: "bg-pink-100",
        textColor: "text-pink-800",
    },
];

const RotatingAds = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % ads.length);
        }, 5000); // 30 seconds

        return () => clearInterval(timer);
    }, []);

    const ad = ads[index];



    return (
        <div className={`${ad.color} ${ad.textColor} rounded-xl p-4 shadow`}>
            <h4 className="font-bold text-lg mb-1">{ad.title}</h4>
            <p className="text-sm mb-2">{ad.description}</p>
            <div className="bg-black text-white text-center rounded py-2 font-semibold">
                Use Code: {ad.code}
            </div>
        </div>
    );
};


/* ---------------- sidebar filters ---------------- */
const sections = [
    {
        title: "Establishment type",
        opts: [
            { id: "restaurants", label: "Restaurants", always: true },
            { id: "coffee", label: "Coffee & Tea", tags: ["#Coffee", "#Tea"] },
            { id: "dessert", label: "Dessert", tags: ["#Dessert"] },
            { id: "quick", label: "Quick Bites", tags: ["#QuickBites"] },
        ],
    },
    {
        title: "Meal type",
        opts: [
            { id: "breakfast", label: "Breakfast", tags: ["#Breakfast"] },
            { id: "brunch", label: "Brunch", tags: ["#Brunch"] },
            { id: "lunch", label: "Lunch", tags: ["#Lunch"] },
            { id: "dinner", label: "Dinner", tags: ["#Dinner"] },
        ],
    },
    {
        title: "Price",
        opts: [
            { id: "cheap", label: "Cheap Eats", tags: ["#Cheap"] },
            { id: "mid", label: "Mid-range", tags: ["#Midrange"] },
            { id: "fine", label: "Fine Dining", tags: ["#FineDining"] },
        ],
    },
];

/* util helpers */
const hasTag = (desc = "", tag) => new RegExp(`${tag}\\b`, "i").test(desc);
const matchesAny = (desc, arr) => arr.some((t) => hasTag(desc, t));



export default function ListFoods() {

    const location = useLocation();
const params = new URLSearchParams(location.search);
const categoryFromURL = params.get("category");
const initialSearch = params.get("search") || "";




    const { user } = useAuth();
    const navigate = useNavigate();

    const [showAds, setShowAds] = useState(true);
    const [hideAds, setHideAds] = useState(false);

    /* ---------- data ---------- */
    const [foods, setFoods] = useState([]);
    const [error, setErr] = useState(null);
    const [loading, setLoad] = useState(true);

    /* ---------- restaurant name cache ---------- */
    const [ownerNames, setOwnerNames] = useState({}); // ownerId -> name
    const [currentRestaurantName, setCurrentRestaurantName] = useState("");

    /* ---------- filters / UI ---------- */
    const [draft, setDraft] = useState(new Set());
    const [activeTags, setActive] = useState([]);
    const [catName, setCat] = useState("");
    const [showProfile, setShowProfile] = useState(false);

    /* ---------- “page” state ---------- */
    const [restaurantId, setRestaurantId] = useState(null); // null ⇒ main list

    /* ---------- cart ---------- */
    const [cart, setCart] = useState([]); // {_id,name,price,qty,owner}

    /* ---------- pop-ups ---------- */
    const [rest, setRest] = useState(null); // {user, menu}
    const [rateDlg, setRateDlg] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);


    /* ---------- search bar ---------- */
    const [searchQuery, setSearchQuery] = useState(initialSearch || "");
    const [showSearchBar, setShowSearchBar] = useState(false);

    useEffect(() => {
        if (categoryFromURL) {
            setCat(categoryFromURL); // sets initial filter
        }
    }, [categoryFromURL]);

    useEffect(() => {
        if (initialSearch) {
            setSearchQuery(initialSearch); // updates search bar
        }
    }, [initialSearch]);

    // useEffect(() => {
    //     if (initialSearch) setSearchQuery(initialSearch);
    //   }, [initialSearch]);

    useEffect(() => {
        setSearchQuery(initialSearch);
      }, [location.search]);

    /* ---------- fetch foods ---------- */
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get("http://localhost:5560/foods");
                setFoods(data);
            } catch {
                setErr("Failed to load foods");
            } finally {
                setLoad(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!showAds) {
            const timer = setTimeout(() => {
                setShowAds(true);
            }, 30000); // Re-show after 2 seconds
            return () => clearTimeout(timer);
        }
    }, [showAds]);



    /* ---------- fetch restaurant names (once per owner) ---------- */
    useEffect(() => {
        const ownerIds = [...new Set(foods.map((f) => f.owner))];
        const missing = ownerIds.filter((id) => !ownerNames[id]);
        if (!missing.length) return;

        (async () => {
            try {
                const responses = await Promise.all(
                    missing.map((id) => axios.get(`http://localhost:8888/api/auth/users/${id}`))
                );
                const namesObj = {};
                responses.forEach((res, i) => {
                    const data = res.data;
                    namesObj[missing[i]] =
                        data.restaurantName || data.name || data.username || missing[i];
                });
                setOwnerNames((prev) => ({ ...prev, ...namesObj }));
                console.log("Loaded ownerNames:", namesObj);
            } catch {
                console.error("Failed to fetch owner names:", err);
            }
        })();
    }, [foods, ownerNames]);

    /* ---------- filters apply ---------- */
    const apply = () => {
        const tags = [];
        sections.forEach(({ opts }) =>
            opts.forEach((o) => o.tags && draft.has(o.id) && tags.push(...o.tags))
        );
        setActive(tags);
        setCat("");
    };

    /* ---------- visible foods ---------- */
    const visibleFoods = useMemo(() => {
        let list = foods;

        if (restaurantId) {
            list = list.filter((f) => f.owner === restaurantId);
        }

        if (catName) {
            list = list.filter((f) =>
                f.name.toLowerCase().includes(catName.toLowerCase())
            );
        }

        if (activeTags.length) {
            list = list.filter((f) => matchesAny(f.description, activeTags));
        }

        if (searchQuery.trim() !== "") {
            const lowerQuery = searchQuery.toLowerCase();
            list = list.filter((f) =>
                f.name.toLowerCase().includes(lowerQuery) ||
                (ownerNames[f.owner] && ownerNames[f.owner].toLowerCase().includes(lowerQuery))
            );
        }

        return list;
    }, [foods, restaurantId, catName, activeTags, searchQuery, ownerNames]);


    /* ---------- grouped by restaurant (main page) ---------- */
    const byRest = useMemo(() => {
        const m = {};
        visibleFoods.forEach((f) => {
            (m[f.owner] ||= []).push(f);
        });
        return m;
    }, [visibleFoods]);

    /* ---------- cart helpers ---------- */
    const addToCart = (food) => {
        if (!restaurantId || food.owner !== restaurantId) return;
        setCart((prev) => {
            const idx = prev.findIndex((i) => i._id === food._id);
            if (idx >= 0) {
                const copy = [...prev];
                copy[idx].qty += 1;
                return copy;
            }
            return [...prev, { ...food, qty: 1 }];
        });
    };
    const decFromCart = (food) =>
        setCart((prev) => {
            const idx = prev.findIndex((i) => i._id === food._id);
            if (idx < 0) return prev;
            const copy = [...prev];
            copy[idx].qty === 1 ? copy.splice(idx, 1) : (copy[idx].qty -= 1);
            return copy;
        });
    const total = useMemo(
        () => cart.reduce((s, i) => s + i.price * i.qty, 0),
        [cart]
    );

    /* ---------- navigation helpers ---------- */
    const enterRestaurant = async (ownerId) => {
        setRestaurantId(ownerId);
        setCat("");
        setActive([]);
        setDraft(new Set());

        if (ownerNames[ownerId]) {
            setCurrentRestaurantName(ownerNames[ownerId]);
        } else {
            try {
                const { data } = await axios.get(
                    `http://localhost:8888/api/auth/users/${ownerId}`
                );
                const name =
                    data.restaurantName || data.name || data.username || "Restaurant";
                setOwnerNames((prev) => ({ ...prev, [ownerId]: name }));
                setCurrentRestaurantName(name);
            } catch {
                setCurrentRestaurantName("Restaurant");
            }
        }
    };
    const leaveRestaurant = () => {
        setRestaurantId(null);
        setCurrentRestaurantName("");
    };

    /* ---------- rating helpers ---------- */
    const openRest = async (ownerId) => {
        try {
            const { data } = await axios.get(
                `http://localhost:8888/api/auth/users/${ownerId}`
            );
            const menu = foods.filter((f) => f.owner === ownerId);
            setRest({ user: data, menu });
        } catch {
            alert("Failed to load restaurant");
        }
    };
    const submitRate = async () => {
        if (!selectedRating) return;
        try {
            await axios.post(
                `http://localhost:8888/api/auth/users/${rest.user._id}/rate`,
                { rating: selectedRating }
            );
            const { data } = await axios.get(
                `http://localhost:8888/api/auth/users/${rest.user._id}`
            );
            setRest((p) => ({ ...p, user: data }));
            setRateDlg(false);
        } catch {
            alert("Could not rate");
        }

    };

    const Card = ({ d }) => (
        <div
            className="w-40 h-52 rounded-lg shadow hover:shadow-md transition flex-shrink-0 overflow-hidden cursor-pointer flex flex-col justify-between"
            onClick={() => (!restaurantId ? enterRestaurant(d.owner) : null)}
        >
            <img src={d.image} alt={d.name} className=" mt-5 h-24 w-full object-cover" />

            <div className="p-2 text-xs bg-white mt-auto">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold truncate">{d.name}</h4>
                    {restaurantId && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(d);
                            }}
                        >
                            <AiOutlinePlusCircle className="text-blue-600 text-lg" />
                        </button>
                    )}
                </div>
                <p className="text-gray-600 text-xs">Rs {d.price?.toLocaleString()}</p>

                {!restaurantId && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openRest(d.owner);
                        }}
                        className="text-[10px] text-orange-600 hover:underline mt-1 block"
                    >
                        {ownerNames[d.owner] || "Restaurant"}
                    </button>
                )}
            </div>
        </div>
    );



    /* ===========================  RENDER  =========================== */
    return (
        <div className="font-sans antialiased flex">
            {/* ---------- sidebar ---------- */}
            <aside className="w-64 border-r h-screen sticky top-0 hidden md:flex flex-col items-start">
                {/* Top Logo Only */}
                <div className="w-full px-6 pt-6 pb-4">
                    <Link to="/" className="block">
                        <img
                            src="/public/FasterEatsLogo.png"
                            alt="logo"
                            className="w-20 h-20 ml-12"
                        />
                    </Link>
                </div>

                {/* Filter Section */}
                <div className="px-6 py-4 overflow-y-auto">
                    {restaurantId && (
                        <button
                            onClick={leaveRestaurant}
                            className="flex items-center gap-1 text-sm mb-6 hover:underline"
                        >
                            <AiOutlineArrowLeft /> Back
                        </button>
                    )}

                    {sections.map(({ title, opts }) => (
                        <Fragment key={title}>
                            <h4 className="font-semibold mb-3">{title}</h4>
                            {opts.map((o) => (
                                <label
                                    key={o.id}
                                    className="flex items-center gap-2 mb-2 select-none"
                                >
                                    <input
                                        type="checkbox"
                                        disabled={o.always}
                                        checked={o.always || draft.has(o.id)}
                                        onChange={() =>
                                            !o.always &&
                                            setDraft((p) => {
                                                const n = new Set(p);
                                                n.has(o.id) ? n.delete(o.id) : n.add(o.id);
                                                return n;
                                            })
                                        }
                                        className="accent-black h-4 w-4"
                                    />
                                    <span className={o.always ? "font-medium" : ""}>
                                        {o.label}
                                    </span>
                                </label>
                            ))}
                        </Fragment>
                    ))}

                    <button
                        onClick={apply}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition mt-4"
                    >
                        Search
                    </button>
                </div>
            </aside>


            {/* ---------- main ---------- */}
            <main className="flex-1">
                {/* header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white shadow sticky top-0 z-10">
                    <Link to="/" className="flex items-center gap-2">
                        {/* <img
                            src="/public/FasterEatsLogo.png"
                            alt="logo"
                            className="w-8 h-8"
                        /> */}
                        <span className="text-xl font-semibold">FasterEats</span>
                    </Link>
                    {user && (
                        <button
                            onClick={() => setShowProfile(true)}
                            className="focus:outline-none"
                        >
                            <img
                                src={user.profilePicture || "/public/avatar.png"}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </button>
                    )}
                </header>



                {/* title */}
                <h2 className="font-extrabold text-3xl text-center mt-6 mb-4">
                    {restaurantId ? currentRestaurantName || "Restaurant" : "Get It & Eat It"}
                </h2>



                {/* category strip (main page only) */}
                {!restaurantId && (
                    <section className="max-w-screen-xl mx-auto px-6 mb-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            {/* Heading */}
                            <h3 className="text-2xl ml-10 font-semibold whitespace-nowrap">What’s on your mind?</h3>

                            {/* Search Input */}
                            <div className="flex-grow max-w-md relative">
                                <input
                                    type="text"
                                    placeholder="Search food or restaurant..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                                <svg
                                    className="w-4 h-4 absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-500 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
                                </svg>
                            </div>
                        </div>



                        {/* Category Images */}
                        <div className="flex overflow-x-auto gap-10 pb-4 justify-center mt-6">
                            {categories.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setCat(c.name)}
                                    className="flex-shrink-0 w-28 focus:outline-none text-center"
                                >
                                    <img
                                        src={c.img}
                                        alt={c.name}
                                        className="w-28 h-28 object-cover rounded-full ring-2 ring-transparent hover:ring-black transition"
                                    />
                                    <p className="mt-2 font-medium">{c.name}</p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* filtered band / restaurant menu */}
                {(restaurantId || catName || activeTags.length || searchQuery) && (
                    <section className="max-w-screen-xl mx-auto px-6 py-8">
                        <h3 className="text-xl font-bold mb-5 text-center">
                            {restaurantId ? "All items" : catName || "Filtered foods"}
                        </h3>

                        {!visibleFoods.length ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <img
                                    src="/public/NOStock.svg"
                                    alt="No stock"
                                    className="w-48 h-48 mb-6"
                                />
                                <h4 className="text-lg font-semibold mb-1">No matching items found</h4>
                                <p className="text-sm">Try different keywords or remove filters</p>
                            </div>
                        ) : (
                            <div className="flex gap-6 overflow-x-auto pb-2 justify-center">
                                {visibleFoods.map((f) => (
                                    <Card key={f._id} d={f} />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* grouped by restaurant (main page only) */}
                {!restaurantId && !loading && !error && !searchQuery && !catName && !activeTags.length && (
                    <section className="max-w-screen-xl mx-auto px-6 pb-20">
                        <h3 className="text-xl font-semibold mb-8">Restaurants</h3>
                        {Object.entries(byRest).map(([ownerId, arr]) => (
                            <div key={ownerId} className="mb-12">
                                <h4 className="text-lg font-bold mb-4">
                                    {ownerNames[ownerId] || arr[0].restaurantName || ownerId}
                                </h4>
                                <div className="flex gap-6 overflow-x-auto pb-2">
                                    {arr.map((d) => (
                                        <Card key={d._id + ownerId} d={d} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                )}






                {/* filtered band / restaurant menu */}
                {/* {(restaurantId || catName || activeTags.length) && (
                    <section className="max-w-screen-xl mx-auto px-6 py-8">
                        <h3 className="text-xl font-bold mb-5 text-center">
                            {restaurantId ? "All items" : catName || "Filtered foods"}
                        </h3>
                        <div className="flex gap-6 overflow-x-auto pb-2 justify-center">
                            {visibleFoods.map((f) => (
                                <Card key={f._id} d={f} />
                            ))}
                        </div>
                    </section>
                )} */}



                {/* {loading && <p className="text-center py-20">Loading…</p>}
                {error && <p className="text-center py-20 text-red-600">{error}</p>} */}
            </main>

            {/* ---------- Right Sidebar for Ads ---------- */}
            {showAds && (
                <aside className="hidden lg:flex flex-col w-[25%] h-full fixed right-0 top-0 pr-6 z-10 pointer-events-none">
                    <div className="mt-auto mb-6 pointer-events-auto"> {/* enable interaction inside only */}
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowAds(false);
                                setHideAds(true);
                            }}
                            className="absolute right-7 text-xl font-bold text-gray-600 hover:text-black"
                        >
                            ×
                        </button>

                        {/* Static Offer Box */}
                        <div className="bg-green-100 text-green-800 rounded-xl p-4 shadow mb-6">
                            <h3 className="font-bold text-lg mb-1">10% Off for Loyal Users</h3>
                            <p className="text-sm mb-2">
                                Spend over Rs. 3,000 and get a 10% coupon for your order!
                            </p>
                            <div className="bg-green-600 text-white text-center rounded py-2 font-semibold">
                                Use Code: <span className="font-bold">LOYAL10</span>
                            </div>
                        </div>

                        {/* Rotating Ad Carousel */}
                        <RotatingAds />
                    </div>
                </aside>
            )}



            {/* ---------- right cart ---------- */}
            {cart.length > 0 && (
                <aside className="fixed right-0 top-0 w-72 h-full bg-white border-l shadow px-4 py-6 overflow-y-auto z-40">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <AiOutlineShoppingCart /> Cart
                        </h3>
                        <button
                            className="text-sm text-gray-600 hover:text-black"
                            onClick={() => setCart([])}
                        >
                            <AiOutlineClose />
                        </button>
                    </div>

                    {cart.map((i) => (
                        <div key={i._id} className="mb-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{i.name}</p>
                                <p className="text-sm text-gray-600">
                                    Rs {(i.price * i.qty).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => decFromCart(i)}>
                                    <AiOutlineMinusCircle className="text-lg text-blue-600" />
                                </button>
                                <span className="px-2">{i.qty}</span>
                                <button onClick={() => addToCart(i)}>
                                    <AiOutlinePlusCircle className="text-lg text-blue-600" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <p className="font-semibold mt-4">
                        Total: Rs {total.toLocaleString()}
                    </p>
                    <button
                        className="mt-4 w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
                        onClick={() =>
                            navigate("/payment", {
                                state: {
                                    cart,                  // items in cart
                                    ownerId: restaurantId, // restaurant owner _id
                                    restaurantName: currentRestaurantName,
                                    total,                 // subtotal of items
                                },
                            })
                        }
                    >
                        Move to Payment
                    </button>
                </aside>
            )}

            {/* profile popup */}
            {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

            {/* restaurant profile & rating pop-ups (unchanged) */}
            {rest && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-lg p-6 relative">
                        <button
                            onClick={() => setRest(null)}
                            className="absolute top-2 right-2 text-lg text-gray-600 hover:text-black"
                        >
                            <AiOutlineClose />
                        </button>

                        <div className="flex flex-col items-center">
                            <img
                                src={rest.user.profilePicture || "/default-profile.png"}
                                alt="avatar"
                                className="w-24 h-24 rounded-full object-cover border"
                            />
                            <h3 className="text-2xl font-bold mt-3">
                                {rest.user.restaurantName || "Restaurant"}
                            </h3>
                            {rest.user.address && (
                                <p className="text-gray-600 text-sm mt-1">
                                    {rest.user.address}
                                </p>
                            )}

                            <div className="flex items-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setSelectedRating(v)}
                                        className="text-2xl"
                                    >
                                        {v <= (rest.user.rating || 0) ? (
                                            <AiFillStar className="text-yellow-500" />
                                        ) : selectedRating >= v ? (
                                            <AiFillStar className="text-yellow-500" />
                                        ) : (
                                            <AiOutlineStar className="text-gray-400" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setRateDlg(true)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                            >
                                Give Rating
                            </button>
                        </div>

                        <h4 className="font-semibold mt-6 mb-3">Menu</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto text-sm">
                            {rest.menu.map((f) => (
                                <div key={f._id} className="flex justify-between">
                                    <span>{f.name}</span>
                                    <span className="text-gray-600">Rs {f.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* rating dialog */}
                    {rateDlg && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
                            <div className="bg-white w-80 p-6 rounded-lg relative text-center">
                                <button
                                    className="absolute top-2 right-2 text-lg text-gray-600 hover:text-black"
                                    onClick={() => setRateDlg(false)}
                                >
                                    <AiOutlineClose />
                                </button>
                                <h4 className="font-semibold mb-4">Rate this restaurant</h4>
                                <div className="flex justify-center gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Fragment key={i}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name="rate"
                                                    className="hidden"
                                                    onChange={() => setSelectedRating(i)}
                                                />
                                                {i <= selectedRating ? (
                                                    <AiFillStar className="text-yellow-500 text-2xl cursor-pointer" />
                                                ) : (
                                                    <AiOutlineStar className="text-2xl cursor-pointer" />
                                                )}
                                            </label>
                                        </Fragment>
                                    ))}
                                </div>
                                <button
                                    onClick={submitRate}
                                    className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
