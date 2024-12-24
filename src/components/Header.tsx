"use client";

import Link from "next/link";
import React from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const Header = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  /* eslint-disable */
  const handleSubmit = (e: any) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(searchParams);
    urlParams.set("searchTerm", searchTerm);

    const searchQuery = urlParams.toString();
    router.push(
      `/search?${searchQuery}&type=all&parking=true&furnished=true&offer=false&sort=regularPrice&order=desc`
    );
    setSearchTerm("");
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const searchTermFormUrl = urlParams.get("searchTerm");

    if (searchTermFormUrl) setSearchTerm(searchTermFormUrl);
  }, [searchParams]);

  return (
    <header className="bg-slate-300 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link href="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-600">DV</span>
            <span className="text-slate-700">Estate</span>
          </h1>
        </Link>

        <form
          className="bg-slate-100 p-3 rounded-lg flex items-center"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>

        <ul className="flex gap-6 font-semibold">
          <Link href="/">
            <li className="hidden md:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>
          <Link href="/about">
            <li className="hidden md:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>

          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Link href="/sign-in">
              <li className="hidden md:inline text-slate-700 hover:underline">
                Sign In
              </li>
            </Link>
          </SignedOut>
        </ul>
      </div>
    </header>
  );
};

export default Header;
